import {Router} from "express";

export default interface RouterInterface{
    getRouter(): Router;
}