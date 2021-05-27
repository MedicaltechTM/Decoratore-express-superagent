
/* 


function decoratoreLog(): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {

        // salva un riferimento al metodo originale in questo modo manteniamo i valori attualmente 
        // nel descrittore e non sovrascriviamo ciò che un altro decoratore potrebbe aver fatto al descrittore.
        if (descriptor === undefined) {
            descriptor =<PropertyDescriptor>Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        var originalMethod = descriptor.value;

        //editing the descriptor/value parameter
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var a = args.map(function (a) { return JSON.stringify(a); }).join();
            // note usage of originalMethod here
            var result = originalMethod.apply(this, args);
            var r = JSON.stringify(result);
            console.log("Call: " + propertyKey.toString() + "(" + a + ") => " + r);
            return result;
        };

        // return edited descriptor as opposed to overwriting the descriptor
        return descriptor;
    }
}


export { decoratoreLog as mpLog }; */