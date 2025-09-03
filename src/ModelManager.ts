import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ModelManager {
  // 파인튜닝된 모델 삭제
  async deleteFineTunedModel(modelId: string) {
    try {
      const deleted = await openai.models.delete(modelId);
      console.log('모델 삭제 완료:', deleted);
      return deleted;
    } catch (error) {
      console.error('모델 삭제 실패:', error);
      throw error;
    }
  }

  // 내 파인튜닝 모델 목록 확인
  async listMyModels() {
    const models = await openai.models.list();
    const myModels = models.data.filter((model) => model.id.startsWith('ft:') && model.owned_by === 'your-org-id');

    console.log('내 파인튜닝 모델들:', myModels);
    return myModels;
  }

  // 파인튜닝 작업 취소 (진행 중인 경우)
  async cancelFineTuningJob(jobId: string) {
    try {
      const cancelled = await openai.fineTuning.jobs.cancel(jobId);
      console.log('작업 취소 완료:', cancelled);
      return cancelled;
    } catch (error) {
      console.error('작업 취소 실패:', error);
      throw error;
    }
  }
}
