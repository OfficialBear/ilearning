package com.saas.ilearning.service;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.QuestionDifficultyConstant;
import com.saas.ilearning.common.constant.QuestionTypeConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.dto.QuestionOptionDTO;
import com.saas.ilearning.dto.QuestionSaveDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QuestionValidator {

    public void validate(QuestionSaveDTO dto) {
        if (!QuestionTypeConstant.isValid(dto.getQuestionType())) {
            throw new BaseException(MessageConstant.QUESTION_TYPE_INVALID);
        }
        if (!QuestionDifficultyConstant.isValid(dto.getDifficulty())) {
            throw new BaseException(MessageConstant.QUESTION_DIFFICULTY_INVALID);
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new BaseException(MessageConstant.QUESTION_CONTENT_REQUIRED);
        }

        List<QuestionOptionDTO> options = dto.getOptions() == null ? List.of() : dto.getOptions();
        int type = dto.getQuestionType();
        if (type == QuestionTypeConstant.SAQ) {
            if (!options.isEmpty()) {
                throw new BaseException(MessageConstant.SAQ_OPTION_NOT_ALLOWED);
            }
            return;
        }

        if (options.size() < 2 || options.size() > 8) {
            throw new BaseException(MessageConstant.QUESTION_OPTION_COUNT_INVALID);
        }
        if (type == QuestionTypeConstant.JUDGE && options.size() != 2) {
            throw new BaseException(MessageConstant.JUDGE_OPTION_INVALID);
        }

        int correctCount = 0;
        for (QuestionOptionDTO option : options) {
            if (option.getContent() == null || option.getContent().trim().isEmpty()) {
                throw new BaseException(MessageConstant.QUESTION_OPTION_CONTENT_REQUIRED);
            }
            Integer isCorrect = option.getIsCorrect();
            if (isCorrect == null || (isCorrect != 0 && isCorrect != 1)) {
                throw new BaseException(MessageConstant.QUESTION_CORRECT_COUNT_INVALID);
            }
            if (isCorrect == 1) {
                correctCount++;
            }
        }

        switch (type) {
            case QuestionTypeConstant.SINGLE -> {
                if (correctCount != 1) {
                    throw new BaseException(MessageConstant.QUESTION_CORRECT_COUNT_INVALID);
                }
            }
            case QuestionTypeConstant.MULTIPLE -> {
                if (correctCount < 2) {
                    throw new BaseException(MessageConstant.QUESTION_CORRECT_COUNT_INVALID);
                }
            }
            case QuestionTypeConstant.JUDGE -> {
                if (correctCount != 1) {
                    throw new BaseException(MessageConstant.QUESTION_CORRECT_COUNT_INVALID);
                }
            }
            default -> throw new BaseException(MessageConstant.QUESTION_TYPE_INVALID);
        }
    }
}
