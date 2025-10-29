/**
 * Practice Session Store
 * Manages interactive prayer practice session state
 */

import { create } from 'zustand';

interface PracticeSessionState {
  lesson_id: string;
  total_rakats: number;
  current_rakat: number;
  current_step: number;
  mistakes: number[];
  isActive: boolean;
  startTime: number | null;
}

interface PracticeStore extends PracticeSessionState {
  // Actions
  startSession: (lessonId: string, totalRakats: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextRakat: () => void;
  recordMistake: (stepNo: number) => void;
  endSession: () => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeStore>((set) => ({
  lesson_id: '',
  total_rakats: 0,
  current_rakat: 1,
  current_step: 1,
  mistakes: [],
  isActive: false,
  startTime: null,

  startSession: (lessonId, totalRakats) =>
    set({
      lesson_id: lessonId,
      total_rakats: totalRakats,
      current_rakat: 1,
      current_step: 1,
      mistakes: [],
      isActive: true,
      startTime: Date.now(),
    }),

  nextStep: () =>
    set((state) => ({
      current_step: state.current_step + 1,
    })),

  prevStep: () =>
    set((state) => ({
      current_step: Math.max(1, state.current_step - 1),
    })),

  nextRakat: () =>
    set((state) => {
      if (state.current_rakat < state.total_rakats) {
        return {
          current_rakat: state.current_rakat + 1,
          current_step: 1,
        };
      }
      return state;
    }),

  recordMistake: (stepNo) =>
    set((state) => ({
      mistakes: [...state.mistakes, stepNo],
    })),

  endSession: () =>
    set({
      isActive: false,
    }),

  reset: () =>
    set({
      lesson_id: '',
      total_rakats: 0,
      current_rakat: 1,
      current_step: 1,
      mistakes: [],
      isActive: false,
      startTime: null,
    }),
}));

export default usePracticeStore;
