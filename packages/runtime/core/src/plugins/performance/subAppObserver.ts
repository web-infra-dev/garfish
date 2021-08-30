import { warn } from '@garfish/utils';

// Child app performance monitoring tools
interface IPerformanceData {
  resourceLoadTime: number;
  blankScreenTime: number;
  firstScreenTime: number;
  isFirstRender: boolean;
  entry: string;
  action: string;
}

interface ICallbackFunction {
  (performanceData: IPerformanceData): void;
}

interface IConfig {
  attributes: boolean;
  childList: boolean;
  subtree: boolean;
}

interface IOptions {
  subAppRootSelector: Element | string;
  domObserverMaxTime?: number;
  waitSubAppNotifyMaxTime?: number;
  observeConfig?: IConfig;
}

export class SubAppObserver {
  private observer: MutationObserver;
  private timeLag: number;
  private reportTimeLag: number;
  private observeTimer: number;
  private dataTimer: number;
  private entry: string;
  private subAppBeforeLoadTime: number;
  private subAppBeforeMountTime: number;
  private subAppStartPageShowTime: number;
  private subAppPageShowTime: number;
  private domQuerySelector: Element | string;
  private finishAction: string;
  private config: IConfig;
  private isRecordFinish: boolean;
  private isCallBackFinish: boolean;
  private isStartShowFlag: boolean;
  private isSubAppNotifyFinish: boolean;
  private targetSubscriber: ICallbackFunction[];
  private cbEntryList: string[];
  private performanceData: IPerformanceData;

  constructor(options: IOptions) {
    this.observer = new MutationObserver(
      this._mutationObserverCallback.bind(this),
    );
    this.subAppBeforeLoadTime = 0;
    this.subAppBeforeMountTime = 0;
    this.subAppStartPageShowTime = 0;
    this.subAppPageShowTime = 0;
    this.entry = '';
    this.observeTimer = 0;
    this.dataTimer = 0;
    this.domQuerySelector = options.subAppRootSelector;
    this.config = { attributes: true, childList: true, subtree: true };
    this.targetSubscriber = [];
    this.timeLag = options.domObserverMaxTime || 3000;
    this.reportTimeLag = options.waitSubAppNotifyMaxTime || 10000;
    this.isRecordFinish = false;
    this.cbEntryList = [];
    this.isStartShowFlag = true;
    this.isCallBackFinish = false;
    this.isSubAppNotifyFinish = false;
    this.finishAction = '';
    this.performanceData = {
      resourceLoadTime: 0,
      blankScreenTime: 0,
      firstScreenTime: 0,
      isFirstRender: true,
      entry: '',
      action: '',
    };
  }

  subscribePerformanceData(callback: ICallbackFunction) {
    try {
      this.targetSubscriber.push(callback);
    } catch (e) {
      warn(e);
    }
  }

  subscribePerformanceDataOnce(callback: ICallbackFunction) {
    try {
      const wrapCallback = (performanceData) => {
        callback(performanceData);
        this.unsubscribePerformanceData(wrapCallback);
      };

      this.targetSubscriber.push(wrapCallback);
    } catch (e) {
      warn(e);
    }
  }

  unsubscribePerformanceData(callback: ICallbackFunction) {
    try {
      this.targetSubscriber = this.targetSubscriber.filter(
        (sub) => sub === callback,
      );
    } catch (e) {
      warn(e);
    }
  }

  subAppBeforeLoad(entry: string) {
    this.entry = entry;
    this.isRecordFinish = false;
    this.isSubAppNotifyFinish = false;
    this.subAppBeforeLoadTime = performance.now();
    this.isCallBackFinish = false;
    this._handleSubscribeCallback(false);
  }

  subAppBeforeMount() {
    this.subAppBeforeMountTime = performance.now();
    this._subAppStartObserver();
  }

  subAppUnmount() {
    if (!this.isRecordFinish) {
      this._subAppEndObserver('subAppUnmount');
    }
    this._handleSubscribeCallback(true);
  }

  // The child app actively notifies the first screen loading is complete
  afterRenderNotify() {
    if (!this.isRecordFinish) {
      // If the monitoring rendering has not ended, actively stop the observation and process the data
      this._subAppEndObserver('SubAppRenderNotify');
    } else if (!this.isSubAppNotifyFinish) {
      // If the monitoring rendering has ended, actively update the processed data
      this.isSubAppNotifyFinish = true;
      this.isRecordFinish = true;
      this.finishAction = 'SubAppRenderNotify';
      this._subAppPerformanceDataHandle();
    }
  }

  private _mutationObserverCallback() {
    // Start rendering elements in the child app container to record the dot
    if (this.isStartShowFlag) {
      this.subAppStartPageShowTime = performance.now();
      this.isStartShowFlag = false;
    }

    // The rendering elements in the child app container no longer change for a certain period of time
    clearTimeout(this.observeTimer);
    this.observeTimer = (setTimeout(() => {
      clearTimeout(this.observeTimer);
      if (!this.isRecordFinish) {
        this._subAppEndObserver('MutationObserver');
      }
    }, this.timeLag) as unknown) as number;
  }

  private _subAppEndObserver(finishAction: string) {
    this.isRecordFinish = true;
    this.finishAction = finishAction;
    this.subAppPageShowTime = performance.now();
    this.observer.disconnect();
    this._subAppPerformanceDataHandle();
    this.isStartShowFlag = true;
  }

  private _subAppStartObserver() {
    try {
      const targetNode =
        typeof this.domQuerySelector === 'string'
          ? (document.querySelector(this.domQuerySelector) as HTMLElement)
          : (this.domQuerySelector as HTMLElement);
      this.observer.observe(targetNode, this.config);
      this._subAppClickEventObserver(targetNode);
    } catch (e) {
      warn(e);
    }
  }

  private _subAppPerformanceDataHandle() {
    const timeDifference =
      this.finishAction === 'MutationObserver' ? this.timeLag : 0;
    this.performanceData = {
      resourceLoadTime: this.subAppBeforeMountTime - this.subAppBeforeLoadTime,
      blankScreenTime: this.subAppStartPageShowTime - this.subAppBeforeLoadTime,
      firstScreenTime:
        this.subAppPageShowTime - this.subAppBeforeLoadTime - timeDifference,
      isFirstRender: this.cbEntryList.indexOf(this.entry) === -1,
      entry: this.entry,
      action: this.finishAction,
    };
  }

  private _subAppClickEventObserver(targetNode: HTMLElement) {
    const eventCallback = () => {
      clearTimeout(this.observeTimer);
      if (!this.isRecordFinish) {
        this._subAppEndObserver('UserEvent');
      }
    };
    targetNode.addEventListener('click', eventCallback);
    targetNode.addEventListener('keyup', eventCallback);
    targetNode.addEventListener('keydown', eventCallback);
    targetNode.addEventListener('keypress', eventCallback);
  }

  private _handleCallback() {
    try {
      this.isCallBackFinish = true;
      this.targetSubscriber.forEach((callback) => {
        const {
          firstScreenTime,
          blankScreenTime,
          resourceLoadTime,
          action,
          entry,
        } = this.performanceData;
        if (
          firstScreenTime > 0 &&
          blankScreenTime > 0 &&
          resourceLoadTime > 0 &&
          action &&
          entry
        ) {
          if (__DEV__) {
            console.warn('SUCCESS: ', this.performanceData);
          }
          this.cbEntryList.push(this.entry);
          callback(this.performanceData);
        } else if (__DEV__) {
          console.warn('ERROR: ', this.performanceData);
        }
      });
    } catch (e) {
      warn(e);
    }
  }

  private _handleSubscribeCallback(isImmediately: boolean) {
    try {
      clearTimeout(this.dataTimer);
      if (isImmediately && !this.isCallBackFinish) {
        this._handleCallback();
      } else {
        this.dataTimer = (setTimeout(() => {
          this._handleCallback();
        }, this.reportTimeLag) as unknown) as number;
      }
    } catch (e) {
      warn(e);
    }
  }
}
