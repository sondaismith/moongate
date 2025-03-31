export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timeoutID: number | undefined = undefined;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
        fn.apply(this, args);
        }, delay);
    } as T;
}

export function debounce2(fn, wait:number){
    let timer;
    return function(...args){
        if(timer) {
            clearTimeout(timer); // clear any pre-existing timer
        }
        const context = this; // get the current context
        timer = setTimeout(()=>{
            fn.apply(context, args); // call the function if time expires
        }, wait);
    }
}