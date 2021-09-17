

function Controllo<T>(item: {
    getCheck?: (valore: T) => boolean | Error,
    setCheck?: (valore: T) => boolean | T | Error
}) {
    return function (target: Object, propertyKey: string) {
        let value: T;
        const getter = function () {
            if (item.getCheck && item.getCheck(value) == true) {
                return value;
            }
            else if (item.getCheck == undefined) {
                return value;
            }
        };
        const setter = function (newVal: T) {
            if (item.setCheck instanceof Error) {
                console.log('ciao');
            }
            else if (item.setCheck instanceof Boolean) {
                value = newVal;
            }
            else if (item.setCheck) {
                const tmp = item.setCheck;
                value = <any>tmp;
            } else {
                value = newVal;
            }
            /* if (item.setCheck && item.setCheck(newVal) == true) {
                value = newVal;                
            }
            else if (item.setCheck == undefined) {
                value = newVal;
            } */
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        });
    }
}