import OpenAI from 'openai';
import { SNSStyleFineTuner } from './SNSStyleFineTuner';
import { ModelManager } from './ModelManager';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ModelVersion {
  version: string;
  modelId: string;
  trainingDate: Date;
  description: string;
}

export class ModelVersionManager {
  private versions: ModelVersion[] = [];

  async createNewVersion(description: string, trainingData: any[]) {
    const fineTuner = new SNSStyleFineTuner();

    // 새 버전 학습
    await fineTuner.prepareTrainingData(trainingData);
    const fileId = await fineTuner.uploadTrainingFile('training-data.jsonl');
    const job = await fineTuner.createFineTuningJob(fileId);

    // 작업 완료 대기 (실제로는 webhook이나 polling 구현 필요)
    await this.waitForCompletion(job.id);

    // 완료된 작업에서 모델 ID 얻기
    const completedJob = await openai.fineTuning.jobs.retrieve(job.id);

    if (completedJob.fine_tuned_model) {
      const newVersion: ModelVersion = {
        version: `v${this.versions.length + 1}`,
        modelId: completedJob.fine_tuned_model,
        trainingDate: new Date(),
        description,
      };

      this.versions.push(newVersion);
      console.log('새 버전 생성:', newVersion);
      return newVersion;
    }
  }

  async rollbackToVersion(version: string) {
    const targetVersion = this.versions.find((v) => v.version === version);
    if (!targetVersion) {
      throw new Error(`버전 ${version}을 찾을 수 없습니다.`);
    }

    console.log(`${version}으로 롤백:`, targetVersion.modelId);
    return targetVersion;
  }

  async cleanupOldVersions(keepLatest: number = 3) {
    const manager = new ModelManager();
    const toDelete = this.versions.slice(0, -keepLatest);

    for (const version of toDelete) {
      try {
        await manager.deleteFineTunedModel(version.modelId);
        console.log(`${version.version} 삭제 완료`);
      } catch (error) {
        console.error(`${version.version} 삭제 실패:`, error);
      }
    }

    this.versions = this.versions.slice(-keepLatest);
  }

  private async waitForCompletion(jobId: string): Promise<void> {
    // 실제 구현에서는 적절한 대기/polling 로직 필요
    console.log(`작업 ${jobId} 완료 대기 중...`);
  }
}
