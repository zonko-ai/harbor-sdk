from __future__ import annotations

from harbor_sdk_generated.types.runtime_execute_params import (
    RuntimeExecuteParamsExecutionInputs,
    RuntimeExecuteParamsSources,
)
from harbor_sdk_generated.types.runtime_execute_response import (
    RuntimeExecuteResponseData,
    RuntimeExecuteResponseDataContentVariant0,
    RuntimeExecuteResponseDataContentVariant1,
    RuntimeExecuteResponseDataContentVariant2,
    RuntimeExecuteResponseDataContentVariant2Skill,
    RuntimeExecuteResponseDataContentVariant2SkillFile,
    RuntimeExecuteResponseDataWarning,
)

RuntimeExecuteResult = RuntimeExecuteResponseData
ExecuteResultTextContent = RuntimeExecuteResponseDataContentVariant0
ExecuteResultJsonContent = RuntimeExecuteResponseDataContentVariant1
ExecuteResultSkillBundleContent = RuntimeExecuteResponseDataContentVariant2
ExecuteSkillBundle = RuntimeExecuteResponseDataContentVariant2Skill
ExecuteSkillBundleFile = RuntimeExecuteResponseDataContentVariant2SkillFile
ExecuteResultWarning = RuntimeExecuteResponseDataWarning

__all__ = [
    "RuntimeExecuteParamsExecutionInputs",
    "RuntimeExecuteParamsSources",
    "RuntimeExecuteResult",
    "ExecuteResultTextContent",
    "ExecuteResultJsonContent",
    "ExecuteResultSkillBundleContent",
    "ExecuteSkillBundle",
    "ExecuteSkillBundleFile",
    "ExecuteResultWarning",
]
