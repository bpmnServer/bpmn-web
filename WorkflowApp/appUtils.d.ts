/**
    is called by a script
    
    1.	Notify involved users at a certain event (done by script)
        need to find a way of getting involved users ?
    2.	Allow users to respond through email ,
        by having a url unique for the user that takes them straight to complete the task
        
    
    
    
    createNotification(item,to,when,message,template)

    who:	user/usergroup/expression (assignee/designated/initiator)
            
    when	on/before/after difference
            event:	Start/End/Assign/DueDate/Follow-up
    message

    to:[{user:['user1','user2','$supervisor()']},{group:['managers','HR',$item.candidateUserGroups]}]
    timer: dateAdd(item.dueDate,-10,'day')}
    message:`New Task for you to address ${item.name} - ${item.data.requestType}`
    template: 'default'

    Timer events will not be issued once item is complete


    createNotification(item,to,when,message,template)

    users Map
        user1,group1
        user2,group2
        user3,group3
        user12,group1,group2
        user13,group1,group2,group3
        
**/
declare class AppUtils {
    server: any;
    constructor(server: any);
    dateAdd(date1: any, amount: any, units: any): any;
    /**
        Notify associated users of an upcoming due date

        typically this method is invoked at start event
        and is scheduled at requested time
        request is deleted on Task completion

    **/
    notifyOfDueDate({ item, daysBefore, message }: {
        item: any;
        daysBefore: any;
        message?: string;
    }): Promise<void>;
    /**
        Notify Assigned User of the assignment

        typically this method is invoked at assign event

    **/
    notifyAssigned({ item, message }: {
        item: any;
        message?: string;
    }): Promise<void>;
    notify({ to, template, item, message }: {
        to: any;
        template: any;
        item: any;
        message: any;
    }): Promise<void>;
    getUsers(toList: any): Promise<any[]>;
    getUserNamesInGroup(group: any): Promise<any[]>;
    getUsersInfo(users: any): Promise<any[]>;
}
export { AppUtils };
