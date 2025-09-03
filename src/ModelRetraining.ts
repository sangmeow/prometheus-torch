import { ModelManager } from './ModelManager';
import { SNSStyleFineTuner } from './SNSStyleFineTuner';
class ModelRetraining {
  async retrainModel(oldModelId: string, newTrainingData: any[]) {
    const manager = new ModelManager();
    const fineTuner = new SNSStyleFineTuner();

    try {
      // 1. 기존 모델 삭제 (선택사항)
      await manager.deleteFineTunedModel(oldModelId);

      // 2. 새로운 데이터로 재학습
      await fineTuner.prepareTrainingData(newTrainingData);
      const fileId = await fineTuner.uploadTrainingFile('training-data.jsonl');
      const newJob = await fineTuner.createFineTuningJob(fileId);

      console.log('재학습 시작:', newJob.id);
      return newJob;
    } catch (error) {
      console.error('재학습 실패:', error);
      throw error;
    }
  }
}
