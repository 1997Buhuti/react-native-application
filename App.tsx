/**
 * App entry: shows the login screen until there is a Supabase session, then the todo screen.
 * Data & persistence live in `useTodos`, and auth state lives in `useAuth`.
 */

import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';

import LoginScreen from './components/LoginScreen';
import TodoItem from './components/TodoItem';
import EdgeFunctionDemo from './components/EdgeFunctionDemo';
import { useAuth } from './src/features/auth/useAuth';
import type { Todo } from './src/features/todos/types';
import { useTodos } from './src/features/todos/useTodos';

const ACCENT = '#1C1C1E';

const pressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed ? { opacity: 0.6 } : null;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: #fafafa;
`;

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  padding-horizontal: 28px;
`;

const Header = styled.View`
  padding-top: 48px;
  padding-bottom: 32px;
`;

const Title = styled.Text`
  font-size: 34px;
  font-weight: 300;
  letter-spacing: 0.5px;
  color: #1c1c1e;
`;

const Subtitle = styled.Text`
  margin-top: 6px;
  font-size: 14px;
  color: #8e8e93;
`;

const ErrorText = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  color: #ff3b30;
`;

const UserRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

const UserEmail = styled.Text`
  flex: 1;
  margin-right: 12px;
  font-size: 13px;
  color: #8e8e93;
`;

const SignOutButton = styled.Pressable`
  height: 32px;
  padding-horizontal: 12px;
  border-radius: 16px;
  background-color: #e5e5ea;
  align-items: center;
  justify-content: center;
`;

const SignOutText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: #3a3a3c;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

const Input = styled.TextInput`
  flex: 1;
  height: 48px;
  font-size: 16px;
  color: #2c2c2e;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: #c7c7cc;
  margin-right: 16px;
`;

const AddButton = styled.Pressable<{ disabled?: boolean }>`
  height: 44px;
  min-width: 64px;
  padding-horizontal: 18px;
  border-radius: 22px;
  background-color: ${ACCENT};
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.25 : 1)};
`;

const AddButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
`;

const Divider = styled.View`
  height: ${StyleSheet.hairlineWidth}px;
  background-color: #e5e5ea;
`;

const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

function subtitleFor(todosLength: number, remaining: number, loading: boolean): string {
  if (loading) return 'Loading…';
  if (todosLength === 0) return 'Nothing here yet';
  return `${remaining} of ${todosLength} remaining`;
}

type TodoScreenProps = {
  userEmail: string;
  authError: string | null;
  onSignOut: () => Promise<void>;
};

/** The todo UI. Only mounted while signed in, so its Supabase calls run with a session. */
function TodoScreen({ userEmail, authError, onSignOut }: TodoScreenProps) {
  const [text, setText] = useState('');
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();

  const canAdd = text.trim().length > 0;
  const remaining = todos.filter((t) => !t.completed).length;
  const subtitle = subtitleFor(todos.length, remaining, loading);

  const onAdd = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    await addTodo(value);
  };

  const renderTodo: ListRenderItem<Todo> = ({ item }) => (
    <TodoItem item={item} onToggle={toggleTodo} onDelete={deleteTodo} />
  );

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header>
        <Title>Todo</Title>
        <Subtitle>{subtitle}</Subtitle>
        {error ? <ErrorText>{error}</ErrorText> : null}
        {authError ? <ErrorText>{authError}</ErrorText> : null}

        <UserRow>
          <UserEmail numberOfLines={1}>{userEmail}</UserEmail>
          <SignOutButton onPress={onSignOut} style={pressedStyle} accessibilityRole="button">
            <SignOutText>Sign out</SignOutText>
          </SignOutButton>
        </UserRow>
      </Header>

      <EdgeFunctionDemo onAddSuggestedTask={addTodo} />

      <InputRow>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Add a task"
          placeholderTextColor="#AEAEB2"
          returnKeyType="done"
          onSubmitEditing={onAdd}
          submitBehavior="submit"
        />
        <AddButton
          onPress={onAdd}
          disabled={!canAdd}
          style={pressedStyle}
          accessibilityRole="button"
        >
          <AddButtonText>Add</AddButtonText>
        </AddButton>
      </InputRow>

      {loading && todos.length === 0 ? (
        <Center>
          <ActivityIndicator color={ACCENT} />
        </Center>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodo}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}

export default function App() {
  const auth = useAuth();

  return (
    <SafeAreaProvider>
      <Screen>
        <StatusBar style="dark" />

        {auth.loading ? (
          // Waiting for the saved session check, so we don't flash the login screen.
          <Center>
            <ActivityIndicator color={ACCENT} />
          </Center>
        ) : auth.session ? (
          <TodoScreen
            userEmail={auth.session.user.email ?? 'Signed in'}
            authError={auth.error}
            onSignOut={auth.signOut}
          />
        ) : (
          <LoginScreen
            busy={auth.busy}
            error={auth.error}
            notice={auth.notice}
            onSignIn={auth.signInWithPassword}
            onSignUp={auth.signUpWithPassword}
          />
        )}
      </Screen>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
});
