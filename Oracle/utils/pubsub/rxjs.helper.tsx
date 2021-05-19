import { Subject, Subscription } from 'rxjs';


export class CustomObserable<U, T extends U> {
    
    readonly topic: string ;
    readonly topicSubject: Subject<T> = new Subject<T>(); ;
    private subscriptions: ICustomSubscription[] = [];

    constructor(topic: string)
    {
        this.topic = topic;
    }
    
    async publish(message: T): Promise<boolean> {
        try{
            this.topicSubject?.next(message);
            return true;
        }
        catch(error){
            throw error;
        }
    }

    async subscribe(pageId: string, func: (value: T) => void, subEntity?: U): Promise<boolean> {
        try{
            const subs = this.topicSubject?.subscribe((value: T) => {
                    func({...subEntity, ...value});
            }); 
            if(subs) {
                this.subscriptions.push({pageId: pageId, subscription: subs});
                return true;  
            }    
        }
        catch(error){
            throw error;
        }
        
        return false;
    }

    async unsubscribe(pageId: string): Promise<boolean>  {
        try{
            this.subscriptions.forEach((sub, index, list) => {
                if(sub.pageId === pageId)
                {
                    sub.subscription.unsubscribe();
                    list.splice(index, 1);
                }
             })

             return true;
            }catch(error){
                throw error;
        }

        return false;
    }

}

interface ICustomSubscription {
    pageId: string;
    subscription: Subscription;
}