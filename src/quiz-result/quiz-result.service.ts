import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizResultAnswer } from 'src/types/quizResult';

@Injectable()
export class QuizResultService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found ');
    }
    const quizResult = await this.prisma.quizResult.create({
      data: {
        userId,
        quizId,
        total: quiz._count.questions,
      },
    });

    return quizResult;
  }

  public async findOne(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found ');
    }
    const quizResult = await this.prisma.quizResult.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    if (!quizResult) {
      throw new NotFoundException('quizResult not found ');
    }

    return quizResult;
  }

  public async addAnswer(quizResultId: string, answer: QuizResultAnswer) {
    const quizResult = await this.prisma.quizResult.findUnique({
      where: { id: quizResultId },
    });

    if (!quizResult) {
      throw new NotFoundException('quizResult not found');
    }

    if (quizResult.finished) {
      throw new BadRequestException('Quiz already finished');
    }

    const question = await this.prisma.question.findFirst({
      where: {
        id: answer.questionId,
        quizId: quizResult.quizId,
      },
    });

    if (!question) {
      throw new BadRequestException('Invalid question');
    }

    const selectedAnswer = await this.prisma.answer.findFirst({
      where: {
        id: answer.answerId,
        questionId: question.id,
      },
    });

    if (!selectedAnswer) {
      throw new BadRequestException('Invalid answer');
    }
    const previousAnswers = quizResult.answers as QuizResultAnswer[];
    const alreadyAnswered = previousAnswers.some(
      (a) => a.questionId === question.id,
    );

    if (alreadyAnswered) {
      throw new BadRequestException('Question already answered');
    }

    const isCorrect = selectedAnswer.isCorrect;
    const newScore = isCorrect ? 1 : 0;

    const updated = await this.prisma.quizResult.update({
      where: { id: quizResultId },
      data: {
        score: { increment: newScore },
        currentIndex: { increment: 1 },
        finished: quizResult.currentIndex + 1 === quizResult.total,
        answers: {
          push: {
            questionId: question.id,
            answerId: selectedAnswer.id,
            isCorrect: selectedAnswer.isCorrect,
          },
        },
      },
    });

    return updated;
  }

  public async restartQuiz(quizResultId: string) {
    const quizResult = await this.prisma.quizResult.findUnique({
      where: { id: quizResultId },
    });

    if (!quizResult) {
      throw new NotFoundException('quizResult not found');
    }

    return await this.prisma.quizResult.update({
      where: {
        id: quizResultId,
      },
      data: {
        score: 0,
        currentIndex: 1,
        answers: [],
        finished: false,
      },
    });
  }

  public async getUserQuizHistory(userId: string) {
    return this.prisma.quizResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
