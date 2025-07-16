import express, {Router} from "express";
import RouterInterface from "./router.interface";


export default class UserRouter implements RouterInterface{
    private router: Router;

    constructor(){
        this.router = express.Router();
        // TODO: ADD DB AS USER CONTROLLER'S PARAM, INJECT DB AS DEPENDENCY
    }

    getRouter(){
        return this.router;
    }

}