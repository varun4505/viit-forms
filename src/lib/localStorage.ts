interface PersonalInfo {
  name: string;
  regNumber: string;
  yearOfStudy: string;
  phoneNumber: string;
  branchSpecialization: string;
  gender: string;
  vitEmail: string;
  personalEmail: string;
  domain: string;
  additionalDomains: string;
  joinMonth: string;
  otherOrganizations: string;
  cgpa: string;
}

interface Journey {
  contribution: string;
  projects: string;
  events: string;
  skillsLearned: string;
  overallContribution: number;
  techContribution: number;
  managementContribution: number;
  designContribution: number;
  challenges: string;
  howChanged: string;
}

interface TeamBonding {
  memberBonding: number;
  likelyToSeekHelp: number;
  clubEnvironment: string;
  likedCharacteristics: string;
  dislikedCharacteristics: string;
  favoriteTeammates: string;
  favoriteTeammatesTraits: string;
  improvementSuggestions: string;
}

interface Future {
  whyJoinedVinnovateIT: string;
  wishlistFulfillment: string;
  commitmentRating: number;
  commitmentJustification: string;
  leadershipPreference: string;
  immediateChanges: string;
  upcomingYearChanges: string;
  preferredFellowLeaders: string;
  skillsToLearn: string;
  domainsToExplore: string;
}

interface BoardReview {
  overallBoardPerformance: number;
  boardCommunication: number;
  boardAccessibility: number;
  boardDecisionMaking: number;
  mostEffectiveBoardMember: string;
  boardImprovementSuggestions: string;
  boardAppreciation: string;
}

interface GeneralFeedback {
  overallClubExperience: number;
  recommendToOthers: number;
  additionalComments: string;
  anonymousFeedback: string;
}

export interface FormData {
  personalInfo: PersonalInfo;
  journey: Journey;
  teamBonding: TeamBonding;
  future: Future;
  boardReview: BoardReview;
  generalFeedback: GeneralFeedback;
  currentPage?: number;
  lastSaved?: string;
}

const STORAGE_KEY = 'viit-form-data';

export const saveFormData = (data: FormData): void => {
  try {
    const dataWithTimestamp = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
  }
};

export const loadFormData = (): FormData | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
  }
  return null;
};

export const clearFormData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error);
  }
};

export const hasSavedData = (): boolean => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData !== null;
  } catch (error) {
    console.warn('Failed to check for saved form data:', error);
    return false;
  }
};

export const getLastSavedTime = (): Date | null => {
  try {
    const savedData = loadFormData();
    if (savedData?.lastSaved) {
      return new Date(savedData.lastSaved);
    }
  } catch (error) {
    console.warn('Failed to get last saved time:', error);
  }
  return null;
};

export const formatLastSavedTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
};

export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = 'test-localStorage';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
