import type { RuntimeDomain } from "../domains/runtime";
import type { Runtime } from "../types/runtime.types";
import type { IStrategy } from "../types/strategy.types";

type RuntimeEvaluateStrategyContext = {
    expression: Runtime.JavascriptExpression;
    runtimeDomain: RuntimeDomain;
};

export class RuntimeEvaluateStrategy
    implements IStrategy<RuntimeEvaluateStrategyContext>
{
    public context: RuntimeEvaluateStrategyContext;

    public constructor(context: RuntimeEvaluateStrategyContext) {
        this.context = context;
    }

    public async run(): Promise<void> {
        const exp = this.context.expression.toString();
        await this.context.runtimeDomain.evaluateExpression(exp);

        return;
    }
}
