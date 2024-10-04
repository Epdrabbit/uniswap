import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Checkbox, Flex, Text, TouchableArea } from 'ui/src'
import { Shuffle } from 'ui/src/components/icons/Shuffle'
import { iconSizes } from 'ui/src/theme'
import { NetworkLogo } from 'uniswap/src/components/CurrencyLogo/NetworkLogo'
import { WarningModal } from 'uniswap/src/components/modals/WarningModal/WarningModal'
import { WarningSeverity } from 'uniswap/src/components/modals/WarningModal/types'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { setHasDismissedBridgingWarning } from 'uniswap/src/features/behaviorHistory/slice'
import { toSupportedChainId } from 'uniswap/src/features/chains/utils'
import { ModalName } from 'uniswap/src/features/telemetry/constants'
import { DerivedSwapInfo } from 'uniswap/src/features/transactions/swap/types/derivedSwapInfo'

export function BridgingModal({
  isOpen,
  derivedSwapInfo,
  onContinue,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  derivedSwapInfo: DerivedSwapInfo
}): JSX.Element {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [doNotShowAgainSelected, setDoNotShowAgainSelected] = useState(true)
  const onPressDoNotShowAgain = useCallback(() => {
    setDoNotShowAgainSelected(!doNotShowAgainSelected)
  }, [doNotShowAgainSelected])

  const onContinueWithDismiss = useCallback(() => {
    if (doNotShowAgainSelected) {
      dispatch(setHasDismissedBridgingWarning(true))
    }
    onContinue()
  }, [dispatch, doNotShowAgainSelected, onContinue])

  const fromNetworkRaw = derivedSwapInfo.currencies.input?.currency.chainId
  const fromNetwork = fromNetworkRaw ? toSupportedChainId(fromNetworkRaw) : null
  const toNetworkRaw = derivedSwapInfo.currencies.output?.currency.chainId
  const toNetwork = toNetworkRaw ? toSupportedChainId(toNetworkRaw) : null

  const icon = (
    <Flex row gap="$gap8">
      <NetworkLogo chainId={fromNetwork} shape="square" size={iconSizes.icon20} />
      <Shuffle color="$neutral2" size="$icon.20" />
      <NetworkLogo chainId={toNetwork} shape="square" size={iconSizes.icon20} />
    </Flex>
  )

  return (
    <WarningModal
      backgroundIconColor={false}
      caption={t('swap.bridging.warning.description', {
        fromNetwork: fromNetwork ? UNIVERSE_CHAIN_INFO[fromNetwork].label : '',
        toNetwork: toNetwork ? UNIVERSE_CHAIN_INFO[toNetwork].label : '',
      })}
      rejectText={t('common.button.back')}
      acknowledgeText={t('common.button.continue')}
      acknowledgeButtonTheme="primary"
      icon={icon}
      isOpen={isOpen}
      modalName={ModalName.BridgingWarning}
      severity={WarningSeverity.None}
      title={t('swap.bridging.title')}
      onClose={onClose}
      onAcknowledge={onContinueWithDismiss}
    >
      <TouchableArea onPress={onPressDoNotShowAgain}>
        <Flex row alignItems="center" gap="$spacing4">
          <Checkbox
            size="$icon.20"
            borderColor="$neutral2"
            checked={doNotShowAgainSelected}
            onPress={onPressDoNotShowAgain}
          />
          <Text variant="body3" color="$neutral2" py="$spacing8">
            {t('common.dontShowAgain')}
          </Text>
        </Flex>
      </TouchableArea>
    </WarningModal>
  )
}
