import { now } from "mongoose"
//dlete notification -- only admin
cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now()- 30*24*60*60*1000);
    await NotificationModel.deleteMany({status:"read",createdAt:{$lt: thirtyDaysAgo}})
    console.log("Delete rea botifications");
});