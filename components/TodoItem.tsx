/**
 * One todo row: tap to toggle completion, ✕ to delete.
 */

import { memo } from 'react';
import styled from 'styled-components/native';

import type { Todo } from '../src/features/todos/types';

type Props = {
  item: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

const pressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed ? { opacity: 0.5 } : null;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  min-height: 56px;
`;

const TaskButton = styled.Pressable`
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-height: 44px;
  padding-vertical: 12px;
`;

const Checkbox = styled.View<{ $done: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border-width: 1.5px;
  border-color: #c7c7cc;
  margin-right: 14px;
  background-color: ${({ $done }) => ($done ? '#c7c7cc' : 'transparent')};
`;

const TaskText = styled.Text<{ $done: boolean }>`
  flex: 1;
  font-size: 16px;
  line-height: 22px;
  color: ${({ $done }) => ($done ? '#aeaeb2' : '#2c2c2e')};
  text-decoration-line: ${({ $done }) => ($done ? 'line-through' : 'none')};
`;

const DeleteButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const DeleteMark = styled.Text`
  font-size: 16px;
  color: #aeaeb2;
`;

function TodoItem({ item, onToggle, onDelete }: Props) {
  return (
    <Row>
      <TaskButton
        onPress={() => onToggle(item.id)}
        style={pressedStyle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
      >
        <Checkbox $done={item.completed} />
        <TaskText $done={item.completed}>{item.text}</TaskText>
      </TaskButton>

      <DeleteButton
        onPress={() => onDelete(item.id)}
        style={pressedStyle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.text}`}
      >
        <DeleteMark>✕</DeleteMark>
      </DeleteButton>
    </Row>
  );
}

export default memo(TodoItem);
