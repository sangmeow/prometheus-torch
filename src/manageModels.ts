import { ModelManager } from './ModelManager';
import { ModelVersionManager } from './ModelVersionManager';

async function manageModels() {
  const manager = new ModelManager();
  const versionManager = new ModelVersionManager();

  // 현재 모델들 확인
  await manager.listMyModels();

  // 새 버전 생성
  const newSamples: any[] = [
    /* 새로운 1000개 샘플 */
  ];
  await versionManager.createNewVersion('SNS 스타일 v2 - 더 자연스러운 톤', newSamples);

  // 구버전으로 롤백 (필요시)
  await versionManager.rollbackToVersion('v1');

  // 오래된 버전들 정리
  await versionManager.cleanupOldVersions(2);
}
