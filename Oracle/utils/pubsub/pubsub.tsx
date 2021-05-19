import { CustomObserable } from './rxjs.helper';
import { generateId } from '../shared/common';
import { useEffect } from 'react';

export interface IMessageModel {
    data?: any,
    config?: any
}

export interface ISubscriberEntity {
    action?: string,
    params?: any 
}

const topicCollection: CustomObserable<ISubscriberEntity,ISubscibeModel>[] = [];


export interface ISubscibeModel extends IMessageModel, ISubscriberEntity {
}

export interface ISubscriber extends ISubscriberEntity{
    to: string
}

export type IPubSub = {
    pageId: string
    publish(topic: string, data: IMessageModel ): Promise<boolean>;
    subscribe(topic: string, action:(value: ISubscibeModel) => void, subEntity?: ISubscriberEntity): Promise<boolean>;
    topics: string[]
}

async function getObserableByTopic(topic: string): Promise<CustomObserable<ISubscriberEntity,ISubscibeModel> | undefined>  { 
    return topicCollection.find(x => x.topic === topic);
}

async function createAndGetObserableByTopic(topic: string): Promise<CustomObserable<ISubscriberEntity, ISubscibeModel>> {
    return new CustomObserable<ISubscriberEntity, ISubscibeModel>(topic);
}

const getPubSub = (): IPubSub => {

const pageId = generateId();

const pubsub : IPubSub = {

        pageId: pageId,
        topics: [],
        publish: async (topic: string, message:IMessageModel): Promise<boolean> => {
            getObserableByTopic(topic).then((topicObserable) => {
                if(topicObserable) { 
                    console.log(topic,'published');
                    return  topicObserable.publish({...message}) }
            }).catch((error: any) => {
                    console.error('Publish Error- topic:',topic,'message:',message, 'error:', error);
            });
            return false;
        },

        subscribe: async (topic: string, action:(value: ISubscibeModel) => void, subEntity?: ISubscriberEntity): Promise<boolean> =>{     
            getObserableByTopic(topic).then((topicObserable) => {
            try{
                if(!topicObserable){
                    createAndGetObserableByTopic(topic).then((newTopic) => {
                        topicObserable = newTopic;
                        pubsub.topics.push(topic);
                    }).catch((error) => {
                        throw error;
                    });
                }

                if(topicObserable){
                    topicObserable.subscribe(pageId, action, subEntity);
                    topicCollection.push(topicObserable);
                    
                    console.log(topic,'subscribed');
                    return true;
                }
                else{
                    throw Error('Topic creation failed');
                }
            }catch(error){
                console.error('Subscribe Error- topic:',topic,'error:',error);
            }
            }).catch((error) => {
                console.error('Subscribe Error- topic:',topic,'error:',error);
            });

            return false;
        }
            
    }

    return pubsub;
}


export function usePubSub(performAction: (value: ISubscibeModel) => void, subs: ISubscriber[]) : IPubSub {

        const pubsub: IPubSub = getPubSub();

        useEffect(() => {
                subs.forEach(sub => {
                    pubsub.subscribe(sub.to, performAction, {action: sub.action, params: sub.params});
                })

                return () =>{
                    pubsub.topics.forEach((topic, index, topics) =>{
                         getObserableByTopic(topic).then((topicObserable)=>{
                            if(topicObserable){
                                topicObserable.unsubscribe(pubsub.pageId).then(()=>{
                                    topics.splice(index, 1);
                                    console.log(topic,'unsubscribed');
                                })
                            }
                         });
                        
                    })
                }

        }, []);

    return pubsub;
}

