class i{static async perform(a,r,t,s){return await this[a.action](a,r,t,s)}static async integer(a,r,t,s){let n=Math.floor(Math.random()*(a.args.max-a.args.min+1))+a.args.min;return a.args?.target!=null&&await crs.process.setValue(a.args.target,n,r,t,s),n}static async float(a,r,t,s){let n=Math.random()*(a.args.max-a.args.min+1)+a.args.min;return a.args?.target!=null&&await crs.process.setValue(a.args.target,n,r,t,s),n}}crs.intent.random=i;export{i as RandomActions};
