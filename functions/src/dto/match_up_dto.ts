import {MatchUp} from "./match_up";

export interface MatchUpDto {
    id: number;
    date?: number;
    userId?: string;
    matchUp?: MatchUp;
}