import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class SNSStyleFineTuner {
  async prepareTrainingData(samples: any[]) {
    const jsonlData = samples
      .map((sample) =>
        JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '당신은 SNS 스타일로 자연스럽고 친근한 글을 작성하는 어시스턴트입니다.',
            },
            {
              role: 'user',
              content: sample.prompt,
            },
            {
              role: 'assistant',
              content: sample.snsStyleResponse,
            },
          ],
        })
      )
      .join('\n');

    fs.writeFileSync('training-data.jsonl', jsonlData);
    return 'training-data.jsonl';
  }

  async uploadTrainingFile(filePath: string) {
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'fine-tune',
    });

    console.log('파일 업로드 완료:', file.id);
    return file.id;
  }

  async createFineTuningJob(fileId: string) {
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: 'gpt-3.5-turbo-1106', // 또는 gpt-4
      hyperparameters: {
        n_epochs: 3, // 1000개 샘플이면 3-4 에포크 권장
      },
    });

    console.log('파인튜닝 작업 시작:', fineTune.id);
    return fineTune;
  }

  async checkJobStatus(jobId: string) {
    const job = await openai.fineTuning.jobs.retrieve(jobId);
    console.log('작업 상태:', job.status);
    return job;
  }

  async useFineTunedModel(modelId: string, prompt: string) {
    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: '당신은 SNS 스타일로 자연스럽고 친근한 글을 작성하는 어시스턴트입니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.9, // 창의적인 답변을 위해 높게 설정
    });

    return completion.choices[0].message.content;
  }
}
