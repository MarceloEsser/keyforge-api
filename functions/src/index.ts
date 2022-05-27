import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth, UserRecord} from "firebase-admin/auth";
import {logger} from "firebase-functions";
import * as express from "express";
import {Request, Response} from 'express';
import {MatchUp} from "./dto/match_up";
import {BaseResponse} from "./dto/base/base_response";
import {firestore} from "firebase-admin";
import WriteResult = firestore.WriteResult;

admin.initializeApp();
const db = getFirestore();
// const express = require("express");
const app = express();

const authenticate = async (req: any, res: any, next: any) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        res.status(403).send("Unauthorized");
        return;
    }
    const idToken = authorization.split("Bearer ")[1];
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
        return;
    } catch (e) {
        res.status(403).send("Unauthorized");
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
            status: 200
        }
        res.send(response);

    } catch (e: any) {

        const response: BaseResponse = {
            message: e.toString(),
            code: "error_when_logout",
            status: 500
        }

        res.send(response);
    }
});

app.post("/matchUp", async (req: Request<{}, {}, MatchUp>, res: Response) => {
    const matchUpCollection = db.collection("/matchUp");
    const userId = req.header("userId");

    if (req.body == null) {
        res.sendStatus(500)
    }

    try {
        const matchUp = req.body;

        matchUpCollection.doc().create({
            matchUp,
            userId
        }).then((result: WriteResult) => {

            const response: BaseResponse = {
                message: result.writeTime.toMillis().toString(),
                code: "success_when_write_matchUp",
                status: 200
            }

            res.send(response);
        }).catch((reason: any) => {
            const response: BaseResponse = {
                message: reason.toString(),
                code: "error_when_try_to_write_matchUp",
                status: 500
            }

            functions.logger.info(reason.toString(), {structuredData: true});
            res.send(response);
        });
    } catch (e: any) {
        const response: BaseResponse = {
            message: e.toString(),
            code: "error_when_try_to_write_matchUp",
            status: 500
        }

        functions.logger.info(e, {structuredData: true});
        res.send(response);
    }
});

app.get("/history/:userId", async (req: any, res: any) => {
    const userId = req.params.userId;
    const matchUpCollection = db.collection("/matchUp");
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
