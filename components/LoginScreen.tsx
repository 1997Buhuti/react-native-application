/**
 * Shown instead of the todo list until the user has a Supabase session.
 * Email and password only. The form keeps its own input state and sends values up on submit.
 */

import { useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  busy: boolean;
  error: string | null;
  notice: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
};

const pressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed ? { opacity: 0.7 } : null;

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  padding-horizontal: 28px;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 34px;
  font-weight: 300;
  letter-spacing: 0.5px;
  color: #1c1c1e;
`;

const Subtitle = styled.Text`
  margin-top: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  line-height: 20px;
  color: #8e8e93;
`;

const Field = styled.TextInput`
  height: 52px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #c7c7cc;
  background-color: #ffffff;
  font-size: 16px;
  color: #1c1c1e;
`;

const PrimaryButton = styled.Pressable<{ disabled?: boolean }>`
  height: 52px;
  margin-top: 8px;
  border-radius: 26px;
  background-color: #1c1c1e;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

const PrimaryButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const SecondaryButton = styled.Pressable<{ disabled?: boolean }>`
  height: 52px;
  margin-top: 12px;
  border-radius: 26px;
  border-width: 1px;
  border-color: #c7c7cc;
  background-color: #ffffff;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

const SecondaryButtonText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #1c1c1e;
`;

const ErrorText = styled.Text`
  margin-top: 16px;
  font-size: 13px;
  color: #ff3b30;
`;

const NoticeText = styled.Text`
  margin-top: 16px;
  font-size: 13px;
  color: #248a3d;
`;

export default function LoginScreen({ busy, error, notice, onSignIn, onSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Both buttons need a value in each field, and nothing may be running.
  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Title>Todo</Title>
      <Subtitle>Sign in or create an account to see your tasks.</Subtitle>

      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#AEAEB2"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />

      <Field
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#AEAEB2"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
      />

      <PrimaryButton
        onPress={() => onSignIn(email.trim(), password)}
        disabled={!canSubmit}
        style={pressedStyle}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <PrimaryButtonText>Sign in</PrimaryButtonText>
        )}
      </PrimaryButton>

      <SecondaryButton
        onPress={() => onSignUp(email.trim(), password)}
        disabled={!canSubmit}
        style={pressedStyle}
        accessibilityRole="button"
      >
        <SecondaryButtonText>Create account</SecondaryButtonText>
      </SecondaryButton>

      {error ? <ErrorText>{error}</ErrorText> : null}
      {notice ? <NoticeText>{notice}</NoticeText> : null}
    </Container>
  );
}
