import '@logseq/libs';
import React, {useState} from 'react';
import './App.css';
import {v4 as uuid} from 'uuid';
import {makeSelectorCSS} from './makeSelectorCSS';

export enum AttributeSelector {
    Prefix = "^",
    Suffix = "$",
    Substring = "*",
};

export type BlockStyle = {
  value: string;
  selector: AttributeSelector;
  character?: string;
  color?: string;
};

export type BlockStyles = {[key: string]: BlockStyle};

const makeCSS = (customizations: BlockStyles) => {
  return Object.entries(customizations)
    .map((customization) => makeSelectorCSS(...customization))
    .join('\n\n');
};

const App = () => {
  const [blockStyles, setBlockStylesInStateOnly] = useState<BlockStyles>(() => {
    const rawStyles = JSON.parse(logseq.settings.blockStyles) as any;
    const styles: BlockStyles = {};
    let needsMigration = false;

    for (const [key, style] of Object.entries(rawStyles)) {
      // Old settings only allowed using 'prefix' selector.
      // Update them to the new format if required.
      if ('prefix' in style) {
        styles[key] = {
          value: style.prefix,
          selector: AttributeSelector.Prefix,
          character: style.character,
          color: style.color,
        } as BlockStyle;

        needsMigration = true;
      } else {
        styles[key] = style as BlockStyle;
      }
    }

    if (needsMigration) {
      logseq.updateSettings({blockStyles: JSON.stringify(styles)});
    }

    return styles;
  });

  React.useEffect(() => {
    logseq.provideStyle({
      key: 'logseq-reference-styles-style',
      style: makeCSS(blockStyles),
    });
  }, [blockStyles]);

  const setBlockStyles = (blockStyles: BlockStyles) => {
    setBlockStylesInStateOnly(blockStyles);
    logseq.updateSettings({blockStyles: JSON.stringify(blockStyles)});
  };

  const handleAdd = () => {
    const id = uuid();
    setBlockStyles({
      ...blockStyles,
      [id]: {value: 'Party: ', selector: AttributeSelector.Prefix, character: '🎉'},
    });
  };

  const handleClose = async (e: any) => {
    logseq.hideMainUI({restoreEditingCursor: true});
  };

  const handleChange = (name: string, blockStyle: BlockStyle) => {
    setBlockStyles({...blockStyles, [name]: blockStyle});
  };

  const handleDelete = (name) => {
    const newStyles = {
      ...blockStyles,
    };
    delete newStyles[name];
    setBlockStyles(newStyles);
  };

  return (
    <div
      tabIndex={-1}
      style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)'}}
      onClick={(e) => {
        logseq.hideMainUI({restoreEditingCursor: true});
      }}
    >
      <div
        className="block-reference-container"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="closeButton" onClick={handleClose}>
          X
        </div>

        {Object.entries<BlockStyle>({
          ...blockStyles,
        }).map(([name, blockStyle]) => {
          const {value, selector, character, color} = blockStyle;
          return (
              <div key={name} className="block-ref-style-wrapper">
              <div className="block-ref-style">
                <input
                  type="text"
                  className="block-ref-input fix"
                  value={value}
                  onChange={(e) =>
                    handleChange(name, {
                      ...blockStyle,
                      value: e.target.value,
                    })
                  }
                />
                <select
                  className="block-ref-input selector"
                  value={selector}
                    onChange={(e) =>
                      handleChange(name, {
                        ...blockStyle,
                        selector: e.target.value as AttributeSelector
                      })
                    }
                >
                  <option value={AttributeSelector.Prefix}>Prefix</option>
                  <option value={AttributeSelector.Suffix}>Suffix</option>
                  <option value={AttributeSelector.Substring}>Substring</option>
                </select>
                <input
                  type="text"
                  className="block-ref-input char"
                  value={character || ''}
                  onChange={(e) =>
                    handleChange(name, {
                      ...blockStyle,
                      character: e.target.value,
                    })
                  }
                />
                <input
                  type="color"
                  className="block-ref-input color"
                  value={color || '#000000'}
                  onChange={(e) =>
                    handleChange(name, {...blockStyle, color: e.target.value})
                  }
                />
              </div>
              <input
                className="btn btn-block-remove"
                type="button"
                value="X"
                onClick={() => handleDelete(name)}
              />
            </div>
          );
        })}

        <input
          className="btn btn-add"
          type="button"
          value="Add"
          onClick={() => handleAdd()}
        />
      </div>
    </div>
  );
};

export default App;
