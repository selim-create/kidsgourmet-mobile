import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      return (
        <View className="flex-1 items-center justify-center bg-light px-6">
          <Ionicons name="alert-circle-outline" size={56} color={COLORS.primary} />
          <Text className="text-dark text-xl font-bold mt-4 text-center">
            Bir şeyler ters gitti
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="mt-6 bg-primary px-6 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <>{this.props.children}</>;
  }
}
