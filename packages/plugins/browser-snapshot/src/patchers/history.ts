let rawPushState: any;
let rawReplaceState: any;

export class PatchHistory {
  public activate() {
    if (!rawPushState || !rawReplaceState) {
      rawPushState = window.history.pushState;
      rawReplaceState = window.history.replaceState;
    }
  }

  public deactivate() {
    window.history.pushState = rawPushState;
    window.history.replaceState = rawReplaceState;
  }
}
