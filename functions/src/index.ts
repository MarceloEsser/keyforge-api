import * as functions from "firebase-functions";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth, UserRecord} from "firebase-admin/auth";
import * as express from "express";
import {Request, Response} from "express";
import {BaseResponse} from "./dto/base/base_response";
import {MatchUpDto} from "./dto/match_up_dto";
import {RequestStatus} from "./dto/base/request_status";
import WriteResult = firestore.WriteResult;

admin.initializeApp();
const db = getFirestore();
// const express = require("express");
const app = express();

const authenticate = async (req: any, res: any, next: any) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        res.status(RequestStatus.unauthorized).send("Unauthorized");
        return;
    }
    const idToken = authorization.split("Bearer ")[1];
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
        return;
    } catch (e) {
        res.status(RequestStatus.unauthorized).send("Unauthorized");
        return;
    }
};

app.use(authenticate);


app.post("/logout", async (req: any, res: any) => {
    const body = req.body;
    try {
        await getAuth().revokeRefreshTokens(body.uid);
        const response: BaseResponse = {
            message: "success_when_logout",
            code: "success_when_logout",
            status: RequestStatus.success
        }
        res.status(RequestStatus.success).send(response);

    } catch (e: any) {

        const response: BaseResponse = {
            message: e.toString(),
            code: "error_when_logout",
            status: 500
        }

        res.status(RequestStatus.internalError).send(response);
    }
});

app.put("/history", async (req: Request<{}, {}, MatchUpDto>, res: Response) => {
    const collection = db.collection("/history");
    const history = req.body;

    if (history.userId == null) {
        res.status(RequestStatus.internalError).send(provideMatchUpInsertErrorResponse("invalid user id"))
        return;
    }
    if (history.date == null) {
        res.status(RequestStatus.internalError).send(provideMatchUpInsertErrorResponse("invalid date"))
        return;
    }

    if (history.matchUp === undefined) {
        res.status(RequestStatus.internalError).send(provideMatchUpInsertErrorResponse("invalid matchUp"))
        return;
    }

    if (history.matchUp?.isBlueKeyForged
        || history.matchUp?.isRedKeyForged
        || history.matchUp?.isYellowKeyForged == undefined) {
        res.status(RequestStatus.internalError).send(provideMatchUpInsertErrorResponse("invalid key forge validation"))
        return;
    }

    collection.doc().create({
        history,
    }).then((result: WriteResult) => {
        const response: BaseResponse = {
            message: result.writeTime.toMillis().toString(),
            code: "success_when_write_matchUp",
            status: RequestStatus.created
        }
        res.status(RequestStatus.created).send(response);
    }).catch((reason: any) => {
        res.status(RequestStatus.internalError).send(provideMatchUpInsertErrorResponse(
            reason.toString()));
    });

});

function provideMatchUpInsertErrorResponse(message: string): BaseResponse {
    return {
        message: message,
        code: "error_when_try_to_write_matchUp",
        status: RequestStatus.internalError
    }
}

//
// function handleMatchUpRequestBody(req: Request<{}, {}, MatchUp>): MatchUp {
//     var matchUp: MatchUp;
//     if(req.body != null)
//     return {}
// }

app.get("/history/:userId", async (req: any, res: any) => {
    const userId = req.params.userId;
    const matchUpCollection = db.collection("/history");
    try {
        matchUpCollection.where("userId", "==", userId).get().then((result) => {
            res.send(result.size);
            logger.log(result.size);
        }).catch((error) => {
            res.send(error)
        });
    } catch (e) {
        logger.log("trying to get the history " + e);
        res.send(e);
    }
});

app.post("/createAccount", async (req: any, res: any) => {
    try {
        const body = req.body;

        getAuth()
            .createUser({
                email: body.email,
                displayName: body.name,
                password: body.password,
            })
            .then((userRecord: UserRecord) => {
                const docRef = db.collection("/user").doc(userRecord.uid);
                docRef.set({
                    name: userRecord.displayName,
                    email: userRecord.email,
                });
            })
            .catch((error: any) => {
                console.log("Error creating new user:", error);
            });

        res.sendStatus(200);
    } catch (e) {
        functions.logger.info(e, {structuredData: true});
        res.send(e);
    }
});

exports.api = functions.https.onRequest(app);
