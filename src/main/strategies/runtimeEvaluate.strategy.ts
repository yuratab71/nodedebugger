import { RuntimeDomain } from "../domains/runtime";
import { Runtime } from "../types/runtime.types";
import { IStrategy } from "../types/strategy.types";

type RuntimeEvaluateStrategyContext = {
    expression: Runtime.JavascriptExpression;
    runtimeDomain: RuntimeDomain;
};

export class RuntimeEvaluateStrategy
    implements IStrategy<RuntimeEvaluateStrategyContext>
{
    public readonly context: RuntimeEvaluateStrategyContext;

    public constructor(context: RuntimeEvaluateStrategyContext) {
        this.context = context;
    }

    public async run(): Promise<void> {
        const exp = this.context.expression.toString();
        await this.context.runtimeDomain.evaluateExpression(exp);

        return;
    }
}
