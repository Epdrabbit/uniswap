import Column from 'components/Column'
import { ConfirmModalState } from 'components/ConfirmSwapModal'
import { Sign } from 'components/Icons/Sign'
import { Swap } from 'components/Icons/Swap'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { SupportArticleURL } from 'constants/supportArticles'
import { useBlockConfirmationTime } from 'hooks/useBlockConfirmationTime'
import { useColor } from 'hooks/useColor'
import { SwapResult } from 'hooks/useSwapCallback'
import { t } from 'i18n'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { isLimitTrade, isUniswapXSwapTrade, isUniswapXTradeType } from 'state/routing/utils'
import { useOrder } from 'state/signatures/hooks'
import { useIsTransactionConfirmed, useSwapTransactionStatus } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components'
import { colors } from 'theme/colors'
import { Divider } from 'theme/components'
import { UniswapXOrderStatus } from 'types/uniswapx'
import { TransactionStatus } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { SignatureExpiredError } from 'utils/errors'
import { useChainId } from 'wagmi'

import { Step, StepDetails, StepStatus } from './Step'

const DividerContainer = styled(Column)`
  height: 28px;
  padding: 0px 16px;
  justify-content: center;
`
const Edge = styled.div`
  width: 2px;
  height: 10px;
  background-color: ${({ theme }) => theme.neutral3};
  margin: 0px 27px;
`
type ProgressIndicatorStep = Extract<
  ConfirmModalState,
  | ConfirmModalState.APPROVING_TOKEN
  | ConfirmModalState.PERMITTING
  | ConfirmModalState.PENDING_CONFIRMATION
  | ConfirmModalState.WRAPPING
  | ConfirmModalState.RESETTING_TOKEN_ALLOWANCE
>
export default function ProgressIndicator({
  steps,
  currentStep,
  trade,
  swapResult,
  wrapTxHash,
  tokenApprovalPending = false,
  revocationPending = false,
  swapError,
  onRetryUniswapXSignature,
}: {
  steps: ProgressIndicatorStep[]
  currentStep: ProgressIndicatorStep
  trade?: InterfaceTrade
  swapResult?: SwapResult
  wrapTxHash?: string
  tokenApprovalPending?: boolean
  revocationPending?: boolean
  swapError?: Error | string
  onRetryUniswapXSignature?: () => void
}) {
  const chainId = useChainId()
  const nativeCurrency = useNativeCurrency(chainId)
  const inputTokenColor = useColor(trade?.inputAmount.currency.wrapped)
  const theme = useTheme()

  // Dynamic estimation of transaction wait time based on confirmation of previous block
  const { blockConfirmationTime } = useBlockConfirmationTime()
  const [estimatedTransactionTime, setEstimatedTransactionTime] = useState<number>()
  useEffect(() => {
    // Value continuously updates as new blocks get confirmed
    // Only set step timers once to prevent resetting
    if (blockConfirmationTime && !estimatedTransactionTime) {
      // Add buffer to account for variable confirmation
      setEstimatedTransactionTime(Math.ceil(blockConfirmationTime * 1.2))
    }
  }, [blockConfirmationTime, estimatedTransactionTime])

  const swapStatus = useSwapTransactionStatus(swapResult)
  const uniswapXOrder = useOrder(isUniswapXTradeType(swapResult?.type) ? swapResult.response.orderHash : '')

  const swapConfirmed =
    swapStatus === TransactionStatus.Confirmed || uniswapXOrder?.status === UniswapXOrderStatus.FILLED
  const wrapConfirmed = useIsTransactionConfirmed(wrapTxHash)

  const swapPending = swapResult !== undefined && !swapConfirmed
  const wrapPending = wrapTxHash != undefined && !wrapConfirmed
  const transactionPending = revocationPending || tokenApprovalPending || wrapPending || swapPending

  // Retry logic for UniswapX orders when a signature expires
  const [signatureExpiredErrorId, setSignatureExpiredErrorId] = useState('')
  useEffect(() => {
    if (swapError instanceof SignatureExpiredError && swapError.id !== signatureExpiredErrorId) {
      setSignatureExpiredErrorId(swapError.id)
      onRetryUniswapXSignature?.()
    }
  }, [onRetryUniswapXSignature, signatureExpiredErrorId, swapError])

  function getStatus(targetStep: ProgressIndicatorStep) {
    const currentIndex = steps.indexOf(currentStep)
    const targetIndex = steps.indexOf(targetStep)
    if (currentIndex < targetIndex) {
      return StepStatus.PREVIEW
    } else if (currentIndex === targetIndex) {
      return transactionPending ? StepStatus.IN_PROGRESS : StepStatus.ACTIVE
    } else {
      return StepStatus.COMPLETE
    }
  }

  const stepDetails: Record<ProgressIndicatorStep, StepDetails> = useMemo(
    () => ({
      [ConfirmModalState.WRAPPING]: {
        icon: <CurrencyLogo currency={trade?.inputAmount.currency} />,
        rippleColor: inputTokenColor,
        previewTitle: t(`Wrap {{symbol}}`, { symbol: nativeCurrency.symbol }),
        actionRequiredTitle: t(`Wrap  {{symbol}} in wallet`, { symbol: nativeCurrency.symbol }),
        inProgressTitle: t(`Wrapping  {{symbol}}...`, { symbol: nativeCurrency.symbol }),
        learnMoreLinkText: t(`Why do I have to wrap my {{symbol}}?`, { symbol: nativeCurrency.symbol }),
        learnMoreLinkHref: SupportArticleURL.WETH_EXPLAINER,
      },
      [ConfirmModalState.RESETTING_TOKEN_ALLOWANCE]: {
        icon: <CurrencyLogo currency={trade?.inputAmount.currency} />,
        rippleColor: inputTokenColor,
        previewTitle: t(`Reset {{symbol}} limit`, { symbol: trade?.inputAmount.currency.symbol }),
        actionRequiredTitle: t(`Reset {{symbol}} limit in wallet`, { symbol: trade?.inputAmount.currency.symbol }),
        inProgressTitle: t(`Resetting {{symbol}} limit...`, { symbol: trade?.inputAmount.currency.symbol }),
      },
      [ConfirmModalState.APPROVING_TOKEN]: {
        icon: <CurrencyLogo currency={trade?.inputAmount.currency} />,
        rippleColor: inputTokenColor,
        previewTitle: t(`Approve {{symbol}} spending`, { symbol: trade?.inputAmount.currency.symbol }),
        actionRequiredTitle: t`Approve in wallet`,
        inProgressTitle: t`Approval pending...`,
        learnMoreLinkText: t`Why do I have to approve a token?`,
        learnMoreLinkHref: SupportArticleURL.APPROVALS_EXPLAINER,
      },
      [ConfirmModalState.PERMITTING]: {
        icon: <Sign />,
        rippleColor: theme.accent1,
        previewTitle: t`Sign message`,
        actionRequiredTitle: t`Sign message in wallet`,
        learnMoreLinkText: t`Why are signatures required?`,
        learnMoreLinkHref: SupportArticleURL.APPROVALS_EXPLAINER,
      },
      [ConfirmModalState.PENDING_CONFIRMATION]: {
        icon: <Swap />,
        rippleColor: colors.blue400,
        previewTitle: isLimitTrade(trade) ? t`Confirm` : t`Confirm swap`,
        actionRequiredTitle: isLimitTrade(trade) ? t`Confirm in wallet` : t`Confirm swap in wallet`,
        inProgressTitle: isLimitTrade(trade) ? t`Pending...` : t`Swap pending...`,
        ...(isUniswapXSwapTrade(trade) && {
          timeToStart: trade.order.info.deadline - Math.floor(Date.now() / 1000),
          delayedStartTitle: t`Confirmation timed out. Please retry.`,
        }),
        learnMoreLinkText: isLimitTrade(trade) ? t`Learn more about limits` : t`Learn more about swaps`,
        learnMoreLinkHref: isLimitTrade(trade)
          ? SupportArticleURL.LEARN_ABOUT_LIMITS
          : SupportArticleURL.HOW_TO_SWAP_TOKENS,
      },
    }),
    [inputTokenColor, nativeCurrency.symbol, trade, theme.accent1]
  )

  if (steps.length === 0) {
    return null
  }

  return (
    <Column>
      <DividerContainer>
        <Divider />
      </DividerContainer>
      {steps.map((step, i) => {
        return (
          <div key={`progress-indicator-step-${i}`}>
            <Step stepStatus={getStatus(step)} stepDetails={stepDetails[step]} />
            {i !== steps.length - 1 && <Edge />}
          </div>
        )
      })}
    </Column>
  )
}
