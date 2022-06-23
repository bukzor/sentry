import {forwardRef, useCallback, useMemo} from 'react';
import styled from '@emotion/styled';

import {IconSettings, IconUser} from 'sentry/icons';
import space from 'sentry/styles/space';
import {FlamegraphFrame} from 'sentry/utils/profiling/flamegraphFrame';
import {formatColorForFrame} from 'sentry/utils/profiling/gl/utils';
import {VirtualizedTreeNode} from 'sentry/utils/profiling/hooks/useVirtualizedTree/VirtualizedTreeNode';
import {FlamegraphRenderer} from 'sentry/utils/profiling/renderers/flamegraphRenderer';

import {FrameCallersTableCell} from './frameStack';

function computeRelativeWeight(base: number, value: number) {
  // Make sure we dont divide by zero
  if (!base || !value) {
    return 0;
  }
  return (value / base) * 100;
}

interface FrameStackTableRowProps {
  flamegraphRenderer: FlamegraphRenderer;
  node: VirtualizedTreeNode<FlamegraphFrame>;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu: React.MouseEventHandler<HTMLDivElement>;
  onExpandClick: (
    node: VirtualizedTreeNode<FlamegraphFrame>,
    opts?: {expandChildren: boolean}
  ) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  onMouseEnter: React.MouseEventHandler<HTMLDivElement>;
  referenceNode: FlamegraphFrame;
  style: React.CSSProperties;
  tabIndex: number;
}

export const FrameStackTableRow = forwardRef<HTMLDivElement, FrameStackTableRowProps>(
  (
    {
      node,
      flamegraphRenderer,
      referenceNode,
      onExpandClick,
      onContextMenu,
      tabIndex,
      onKeyDown,
      onClick,
      onMouseEnter,
      style,
    },
    ref
  ) => {
    const isSelected = tabIndex === 0;
    const colorString = useMemo(() => {
      return formatColorForFrame(node.node, flamegraphRenderer);
    }, [node, flamegraphRenderer]);

    const handleExpanding = useCallback(
      (evt: React.MouseEvent) => {
        evt.stopPropagation();
        onExpandClick(node, {expandChildren: evt.metaKey});
      },
      [node, onExpandClick]
    );

    return (
      <FrameCallersRow
        ref={ref}
        style={style}
        onContextMenu={onContextMenu}
        tabIndex={tabIndex}
        isSelected={isSelected}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <FrameCallersTableCell isSelected={isSelected} textAlign="right">
          {flamegraphRenderer.flamegraph.formatter(node.node.node.selfWeight)}
          <Weight
            isSelected={isSelected}
            weight={computeRelativeWeight(
              referenceNode.node.totalWeight,
              node.node.node.selfWeight
            )}
          />
        </FrameCallersTableCell>
        <FrameCallersTableCell isSelected={isSelected} noPadding textAlign="right">
          <FrameWeightTypeContainer>
            <FrameWeightContainer>
              {flamegraphRenderer.flamegraph.formatter(node.node.node.totalWeight)}
              <Weight
                padded
                isSelected={isSelected}
                weight={computeRelativeWeight(
                  referenceNode.node.totalWeight,
                  node.node.node.totalWeight
                )}
              />
            </FrameWeightContainer>
            <FrameTypeIndicator isSelected={isSelected}>
              {node.node.node.frame.is_application ? (
                <IconUser size="xs" />
              ) : (
                <IconSettings size="xs" />
              )}
            </FrameTypeIndicator>
          </FrameWeightTypeContainer>
        </FrameCallersTableCell>
        <FrameCallersTableCell
          // We stretch this table to 100% width.
          style={{paddingLeft: node.depth * 14 + 8, width: '100%'}}
        >
          <FrameNameContainer>
            <FrameColorIndicator style={{backgroundColor: colorString}} />
            <FrameChildrenIndicator
              tabIndex={-1}
              onClick={handleExpanding}
              open={node.expanded}
            >
              {node.node.children.length > 0 ? '\u203A' : null}
            </FrameChildrenIndicator>
            <FrameName>{node.node.frame.name}</FrameName>
          </FrameNameContainer>
        </FrameCallersTableCell>
      </FrameCallersRow>
    );
  }
);

const Weight = styled(
  (props: {isSelected: boolean; weight: number; padded?: boolean}) => {
    const {weight, padded: __, isSelected: _, ...rest} = props;
    return (
      <div {...rest}>
        {weight.toFixed(1)}%
        <BackgroundWeightBar style={{transform: `scaleX(${weight / 100})`}} />
      </div>
    );
  }
)`
  display: inline-block;
  min-width: 7ch;
  padding-right: ${p => (p.padded ? space(0.5) : 0)};
  color: ${p => (p.isSelected ? p.theme.white : p.theme.subText)};
  opacity: ${p => (p.isSelected ? 0.8 : 1)};
`;

const FrameWeightTypeContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
`;

const FrameTypeIndicator = styled('div')<{isSelected: boolean}>`
  flex-shrink: 0;
  width: 26px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => (p.isSelected ? p.theme.white : p.theme.subText)};
  opacity: ${p => (p.isSelected ? 0.8 : 1)};
`;

const FrameWeightContainer = styled('div')`
  display: flex;
  align-items: center;
  position: relative;
  justify-content: flex-end;
  flex: 1 1 100%;
`;

const BackgroundWeightBar = styled('div')`
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  background-color: ${props => props.theme.yellow100};
  border-bottom: 1px solid ${props => props.theme.yellow200};
  transform-origin: center right;
  height: 100%;
  width: 100%;
`;

const FrameCallersRow = styled('div')<{isSelected: boolean}>`
  display: flex;
  width: calc(100% + 400px);
  color: ${p => (p.isSelected ? p.theme.white : 'inherit')};

  &:focus {
    outline: none;
  }

  &[data-hovered='true']:not([tabindex='0']) {
    > div:first-child,
    > div:nth-child(2) {
      background-color: #edf2fc !important;
    }
  }
`;

const FrameNameContainer = styled('div')`
  display: flex;
  align-items: center;
`;

const FrameChildrenIndicator = styled('button')<{open: boolean}>`
  width: 10px;
  height: 10px;
  display: flex;
  padding: 0;
  border: none;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  user-select: none;
  transform: ${p => (p.open ? 'rotate(90deg)' : 'rotate(0deg)')};
`;

const FrameName = styled('span')`
  margin-left: ${space(0.5)};
`;

const FrameColorIndicator = styled('div')`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  flex-shrink: 0;
  margin-right: ${space(0.5)};
`;
