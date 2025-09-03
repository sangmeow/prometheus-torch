import { SNSStyleFineTuner } from './SNSStyleFineTuner';

async function main() {
  const fineTuner = new SNSStyleFineTuner();

  // 1. 데이터 준비 (1000개 샘플)
  const samples = [
    {
      prompt: '맛집 후기 작성해줘',
      snsStyleResponse: '오늘 친구랑 다녀온 이 집 진짜 찐맛집 인정👍...',
    },
    // ... 나머지 999개
  ];

  // 2. 학습 데이터 파일 생성
  await fineTuner.prepareTrainingData(samples);

  // 3. 파일 업로드
  const fileId = await fineTuner.uploadTrainingFile('training-data.jsonl');

  // 4. 파인튜닝 작업 시작
  const job = await fineTuner.createFineTuningJob(fileId);

  // 5. 작업 완료 후 사용
  // const result = await fineTuner.useFineTunedModel('ft:gpt-3.5-turbo:your-model-id', '여행 후기 써줘');
}

main();
