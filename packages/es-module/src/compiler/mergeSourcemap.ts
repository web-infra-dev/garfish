// The version of `source-map` should always be `0.6.1` with escodegen newspaper,
// otherwise it will package two source code.
import {
  RawSourceMap,
  SourceMapConsumer,
  SourceMapGenerator,
} from 'source-map';
import { transformUrl } from '@garfish/utils';
import type { Output, Compiler } from './index';

const PREFIX_REG = /^[#@]\s?sourceMappingURL\s?=\s?/;

function merge(oldMap: RawSourceMap, newMap: RawSourceMap) {
  const oldMapConsumer = new SourceMapConsumer(oldMap);
  const newMapConsumer = new SourceMapConsumer(newMap);
  const mergedMapGenerator = new SourceMapGenerator();

  newMapConsumer.eachMapping((m) => {
    if (!m.originalLine) return;
    const origPosInOldMap = oldMapConsumer.originalPositionFor({
      line: m.originalLine,
      column: m.originalColumn,
    });

    if (origPosInOldMap.source) {
      mergedMapGenerator.addMapping({
        original: {
          line: origPosInOldMap.line,
          column: origPosInOldMap.column,
        },
        generated: {
          line: m.generatedLine,
          column: m.generatedColumn,
        },
        name: origPosInOldMap.name,
        source: origPosInOldMap.source,
      });
    }
  });

  [oldMapConsumer, newMapConsumer].forEach((consumer) => {
    (consumer as any).sources.forEach((sourceFile: string) => {
      const sourceContent = consumer.sourceContentFor(sourceFile);
      if (sourceContent) {
        mergedMapGenerator.setSourceContent(sourceFile, sourceContent);
      }
    });
  });

  return mergedMapGenerator.toString();
}

export async function mergeSourcemap(compiler: Compiler, output: Output) {
  if (!compiler.sourcemapComment) {
    output.map = output.map.toString();
    return;
  }
  const newMap = (output.map as any).toJSON();
  if (!newMap.mappings) {
    output.map = output.map.toString();
    return;
  }

  try {
    let oldMap;
    const flag = 'base64,';
    const mapInfo = compiler.sourcemapComment.trim().replace(PREFIX_REG, '');
    const index = mapInfo.indexOf(flag);

    if (index > -1) {
      oldMap = JSON.parse(atob(mapInfo.slice(index + flag.length)));
    } else {
      const {
        filename,
        runtime: {
          loader,
          options: { scope },
        },
      } = compiler.options;
      const requestUrl = transformUrl(filename, mapInfo);
      const { code } = await loader.load(scope, requestUrl);
      oldMap = JSON.parse(code);
    }
  
    output.map = oldMap && oldMap.mappings
      ? merge(oldMap, newMap)
      : output.map.toString();
  } catch(e) {
    output.map = output.map.toString();
    console.warn(e);
  }
}
