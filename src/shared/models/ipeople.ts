import { Person } from "./iperson";

export interface People {
    count:    number;
    next:     string;
    previous: null;
    results:  Person[];
}

