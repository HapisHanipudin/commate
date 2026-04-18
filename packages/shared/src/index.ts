// Shared types antara web dan api
export type SkillVector = {
  language: string;
  score: number;
}[];

export type MatchResult = {
  username: string;
  avatarUrl: string;
  matchScore: number;
  topSkills: string[];
};
