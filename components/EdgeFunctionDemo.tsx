/**
 * Educational UI component to demonstrate calling a Supabase Edge Function.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

import { useEdgeDemo } from '../src/features/edge-demo/useEdgeDemo';

type Props = {
  onAddSuggestedTask: (text: string) => void;
};

const pressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed ? { opacity: 0.7 } : null;

const Card = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  border-width: 1px;
  border-color: #e5e5ea;
  padding: 16px;
  margin-bottom: 20px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CardTitle = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #1c1c1e;
`;

const Tag = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #34c759;
  background-color: #e8f8ed;
  padding-horizontal: 8px;
  padding-vertical: 2px;
  border-radius: 6px;
`;

const Description = styled.Text`
  font-size: 13px;
  color: #636366;
  line-height: 18px;
  margin-bottom: 12px;
`;

const PrimaryButton = styled.Pressable<{ disabled?: boolean }>`
  background-color: #007aff;
  border-radius: 8px;
  padding-vertical: 10px;
  padding-horizontal: 14px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const PrimaryButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const ResultBox = styled.View`
  margin-top: 14px;
  padding: 12px;
  background-color: #f2f2f7;
  border-radius: 8px;
`;

const MessageText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const DetailText = styled.Text`
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 10px;
`;

const TaskSuggestionBox = styled.View`
  background-color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  border-width: 1px;
  border-color: #d1d1d6;
  margin-bottom: 10px;
`;

const SuggestionLabel = styled.Text`
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
  margin-bottom: 2px;
`;

const SuggestionText = styled.Text`
  font-size: 14px;
  color: #1c1c1e;
  font-weight: 500;
`;

const ActionRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
`;

const SecondaryButton = styled.Pressable`
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 6px;
  background-color: #e5e5ea;
`;

const SecondaryButtonText = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #3a3a3c;
`;

const AddSuggestionButton = styled.Pressable`
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 6px;
  background-color: #34c759;
`;

const AddSuggestionButtonText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
`;

const ErrorBox = styled.View`
  margin-top: 12px;
  padding: 12px;
  background-color: #fff2f2;
  border-radius: 8px;
  border-width: 1px;
  border-color: #ffccd0;
`;

const ErrorTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #ff3b30;
  margin-bottom: 4px;
`;

const ErrorMessage = styled.Text`
  font-size: 12px;
  color: #c41c13;
  line-height: 16px;
  margin-bottom: 6px;
`;

const ErrorTip = styled.Text`
  font-size: 11px;
  color: #8e8e93;
  font-style: italic;
`;

export default function EdgeFunctionDemo({ onAddSuggestedTask }: Props) {
  const { data, loading, error, callEdgeFunction, clear } = useEdgeDemo();

  const handleAdd = () => {
    if (data?.suggestedTask) {
      onAddSuggestedTask(data.suggestedTask);
    }
  };

  return (
    <Card>
      <HeaderRow>
        <CardTitle>⚡ Edge Function Demo</CardTitle>
        <Tag>Deno Serverless</Tag>
      </HeaderRow>

      <Description>
        Tap below to invoke <CardTitle>hello-world</CardTitle> via{' '}
        <CardTitle>supabase.functions.invoke()</CardTitle>.
      </Description>

      <PrimaryButton
        onPress={() => callEdgeFunction('Students')}
        disabled={loading}
        style={pressedStyle}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <PrimaryButtonText>Call Edge Function</PrimaryButtonText>
        )}
      </PrimaryButton>

      {error ? (
        <ErrorBox>
          <ErrorTitle>Function Invocation Failed</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <ErrorTip>
            Tip: Deploy the function with `npx supabase functions deploy hello-world` or test locally.
          </ErrorTip>
          <ActionRow style={{ marginTop: 8 }}>
            <SecondaryButton onPress={clear} style={pressedStyle}>
              <SecondaryButtonText>Dismiss</SecondaryButtonText>
            </SecondaryButton>
          </ActionRow>
        </ErrorBox>
      ) : null}

      {data ? (
        <ResultBox>
          <MessageText>{data.message}</MessageText>
          <DetailText>Runtime: {data.runtime} • {new Date(data.timestamp).toLocaleTimeString()}</DetailText>

          <TaskSuggestionBox>
            <SuggestionLabel>Server Suggested Task:</SuggestionLabel>
            <SuggestionText>{data.suggestedTask}</SuggestionText>
          </TaskSuggestionBox>

          <ActionRow>
            <SecondaryButton onPress={clear} style={pressedStyle}>
              <SecondaryButtonText>Clear</SecondaryButtonText>
            </SecondaryButton>
            <AddSuggestionButton onPress={handleAdd} style={pressedStyle}>
              <AddSuggestionButtonText>+ Add to Todos</AddSuggestionButtonText>
            </AddSuggestionButton>
          </ActionRow>
        </ResultBox>
      ) : null}
    </Card>
  );
}
