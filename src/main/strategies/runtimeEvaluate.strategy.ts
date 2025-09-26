import { RuntimeDomain } from "@main/domains/runtime";
import { Runtime } from "@main/types/runtime";
import { IStrategy } from "@main/types/strategy";

type RuntimeEvaluateStrategyContext = {
    expression: Runtime.JavascriptExpression;
    runtimeDomain: RuntimeDomain;
};

export class RuntimeEvaluateStrategy
    implements IStrategy<RuntimeEvaluateStrategyContext>
{
    context: RuntimeEvaluateStrategyContext;

    constructor(context: RuntimeEvaluateStrategyContext) {
        this.context = context;
    }

    async run(): Promise<void> {
        const exp = this.context.expression.toString();
        const resp = await this.context.runtimeDomain.evaluateExpression(exp);

        console.log(resp);
        return;
    }
}
