import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MonthlyAlbum } from '../../src/types/Photo';
import { PermissionStatus } from '../../src/types/Error';
import { useAlbumList } from '../../src/hooks/useAlbumList';
import { useTrash } from '../../src/contexts/TrashContext';
import AlbumList from '../../src/components/album/AlbumList';
import AlbumHeader from '../../src/components/album/AlbumHeader';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { theme } from '../../src/styles/theme';
import { commonStyles } from '../../src/styles/common';

export default function AlbumListScreen() {
  const {
    albumGroups,
    loading,
    error,
    permissionStatus,
    refreshing,
    refresh,
    requestPermission,
  } = useAlbumList();

  const { getTotalCount } = useTrash();

  const handleAlbumPress = (album: MonthlyAlbum) => {
    router.push({
      pathname: '/photo-viewer',
      params: {
        year: album.year.toString(),
        month: album.month.toString(),
      },
    });
  };

  const handleTrashPress = () => {
    router.push('/trash-bin');
  };

  const handlePermissionRequest = () => {
    Alert.alert(
      '需要照片访问权限',
      '此应用需要访问您的照片库以便进行照片管理和清理操作。',
      [
        { text: '取消', style: 'cancel' },
        { text: '授权', onPress: requestPermission },
      ]
    );
  };

  // 渲染权限请求界面
  const renderPermissionRequest = () => (
    <View style={commonStyles.centerContainer}>
      <Text style={styles.permissionTitle}>需要照片访问权限</Text>
      <Text style={styles.permissionMessage}>
        此应用需要访问您的照片库以便进行照片管理和清理操作。
      </Text>
      <Pressable
        style={[commonStyles.button, commonStyles.primaryButton, styles.permissionButton]}
        onPress={handlePermissionRequest}
      >
        <Text style={[commonStyles.buttonText, commonStyles.primaryButtonText]}>
          授权访问
        </Text>
      </Pressable>
    </View>
  );

  // 渲染错误界面
  const renderError = () => (
    <View style={commonStyles.errorContainer}>
      <Text style={commonStyles.errorText}>{error}</Text>
      <Pressable
        style={[commonStyles.button, commonStyles.primaryButton]}
        onPress={refresh}
      >
        <Text style={[commonStyles.buttonText, commonStyles.primaryButtonText]}>
          重试
        </Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <AlbumHeader title="照片清理" showTrash={false} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (permissionStatus !== PermissionStatus.GRANTED) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <AlbumHeader title="照片清理" showTrash={false} />
        {renderPermissionRequest()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <AlbumHeader title="照片清理" showTrash={false} />
        {renderError()}
      </SafeAreaView>
    );
  }

  const totalPhotos = albumGroups.reduce(
    (sum, group) => sum + group.months.reduce(
      (monthSum, month) => monthSum + month.photoCount, 0
    ), 0
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <AlbumHeader
        title="照片清理"
        subtitle={`${totalPhotos} 张照片`}
        onTrashPress={handleTrashPress}
        trashCount={getTotalCount()}
      />
      <AlbumList
        albumGroups={albumGroups}
        onAlbumPress={handleAlbumPress}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  permissionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  permissionMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  permissionButton: {
    marginTop: theme.spacing.base,
  },
});