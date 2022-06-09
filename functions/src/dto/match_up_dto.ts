import {MatchUp} from "./match_up";

export interface MatchUpDto {
    id: string;
    date?: number;
    userId?: string;
    challengerId?: string;
    matchUp?: MatchUp;

}
