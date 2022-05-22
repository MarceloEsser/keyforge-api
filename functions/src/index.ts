import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import {logger} from "firebase-functions";
import * as express from "express";

admin.initializeApp();
const db = getFirestore();
// const express = require("express");
const app = express();

// const authenticate = async (req: any, res: any, next: any) => {
//     const authorization = req.headers.authorization;
//
//     if (!authorization || !authorization.startsWith("Bearer ")) {
//         res.status(403).send("Unauthorized");
//         return;
//     }
//     const idToken = authorization.split("Bearer ")[1];
//     try {
//         req.user = await admin.auth().verifyIdToken(idToken);
//         next();
//         return;
//     } catch (e) {
//         res.status(403).send("Unauthorized");
//         return;
//     }
// };

// app.use(authenticate);

app.post("/logout", async (req: any, res: any) => {
    const body = req.body;
    try {
        await getAuth().revokeRefreshTokens(body.uid);
        res.send(200);
    } catch (e) {
        res.send(e);
    }
});

app.post("/matchUp", async (req: any, res: any) => {
    const matchupCollection = db.collection("/matchUp");

    try {
        await matchupCollection.doc().create({
            "ambarCounter": req.body.ambarCounter,
            "userId": req.body.userId,
        });

        res.sendStatus(200);
    } catch (e) {
        functions.logger.info(e, {structuredData: true});
        res.send(e);
    }
});

app.get("/history/:userId", async (req: any, res: any) => {
    const header = req.params.userId;
    const matchupCollection = db.collection("/matchUp");
    try {
        matchupCollection.where("userId", "==", header).get().then((result) => {
            res.send(result.size);
            logger.log(result.size);
        }).catch((sla) => {
            logger.log(sla);
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
            .then((userRecord) => {
                const docRef = db.collection("/user").doc(userRecord.uid);
                docRef.set({
                    name: userRecord.displayName,
                    email: userRecord.email,
                });
            })
            .catch((error) => {
                console.log("Error creating new user:", error);
            });

        res.sendStatus(200);
    } catch (e) {
        functions.logger.info(e, {structuredData: true});
        res.send(e);
    }
});

exports.api = functions.https.onRequest(app);
