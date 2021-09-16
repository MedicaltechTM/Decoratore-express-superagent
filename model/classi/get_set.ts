function Controllo<T>(item: {
    getCheck?: (valore: T) => boolean,
    setCheck?: (valore: T) => boolean
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
            if (item.setCheck && item.setCheck(newVal) == true) {
                value = newVal;
            }
            else if (item.setCheck == undefined) {
                value = newVal;
            }
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        });
    }
}