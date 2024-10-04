import { ColumnCenter } from 'components/deprecated/Column'
import { useCurrency } from 'hooks/Tokens'
import { useScroll } from 'hooks/useScroll'
import { TokenCloud } from 'pages/Landing/components/TokenCloud'
import { Hover, RiseIn, RiseInText } from 'pages/Landing/components/animations'
import { Swap } from 'pages/Swap'
import { Fragment, useCallback } from 'react'
import { ChevronDown } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { serializeSwapStateToURLParameters } from 'state/swap/hooks'
import { Flex, Text } from 'ui/src'
import { SwapRedirectFn } from 'uniswap/src/features/transactions/TransactionModal/TransactionModalContext'
import { Trans, useTranslation } from 'uniswap/src/i18n'
import { INTERFACE_NAV_HEIGHT } from 'uniswap/src/theme/heights'
import { UniverseChainId } from 'uniswap/src/types/chains'

interface HeroProps {
  scrollToRef: () => void
  transition?: boolean
}

export function Hero({ scrollToRef, transition }: HeroProps) {
  const { height: scrollPosition } = useScroll()
  const initialInputCurrency = useCurrency('ETH')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const translateY = -scrollPosition / 7
  const opacityY = 1 - scrollPosition / 1000

  const swapRedirectCallback = useCallback(
    ({ inputCurrency, outputCurrency, typedValue, independentField, chainId }: Parameters<SwapRedirectFn>[0]) => {
      navigate(
        `/swap${serializeSwapStateToURLParameters({
          inputCurrency,
          outputCurrency,
          typedValue,
          independentField,
          chainId,
        })}`,
      )
    },
    [navigate],
  )

  return (
    <Flex
      position="relative"
      justifyContent="center"
      y={translateY}
      opacity={opacityY}
      minWidth="100%"
      minHeight="100vh"
      height="min-content"
      pt={INTERFACE_NAV_HEIGHT}
      pointerEvents="none"
    >
      <TokenCloud transition={transition} />

      <Flex
        alignSelf="center"
        maxWidth="85vw"
        pointerEvents="none"
        pt={48}
        gap="$gap20"
        transform={`translate(0px, ${translateY}px)`}
        opacity={opacityY}
        $lg={{ pt: 24 }}
        $sm={{ pt: 8 }}
        $platform-web={{
          transition: transition ? 'shrinkAndFade 1s ease-in-out forwards' : undefined,
        }}
      >
        <Flex maxWidth={920} alignItems="center" pointerEvents="none">
          <Text
            variant="heading1"
            fontSize={64}
            lineHeight={76}
            textAlign="center"
            fontWeight="$book"
            $md={{ fontSize: 52 }}
            $sm={{ variant: 'heading2', fontSize: 36 }}
            $short={{ variant: 'heading2', fontSize: 36 }}
          >
            {t('hero.swap.title')
              .split(' ')
              .map((word, index) => {
                if (word === '<br/>') {
                  return <br key={word} />
                } else {
                  return (
                    <Fragment key={word}>
                      <RiseInText delay={index * 0.1}>{word}</RiseInText>{' '}
                    </Fragment>
                  )
                }
              })}
          </Text>
        </Flex>

        <RiseIn delay={0.4}>
          <Flex
            pointerEvents="auto"
            width={480}
            p="$padding8"
            borderRadius="$rounded24"
            backgroundColor="$surface1"
            maxWidth="100%"
          >
            <Swap
              hideHeader
              hideFooter
              syncTabToUrl={false}
              chainId={initialInputCurrency?.chainId ?? UniverseChainId.Mainnet}
              initialInputCurrency={initialInputCurrency}
              swapRedirectCallback={swapRedirectCallback}
            />
          </Flex>
        </RiseIn>

        <RiseIn delay={0.3}>
          <Text variant="body1" textAlign="center" maxWidth={430} color="$neutral2" $short={{ variant: 'body2' }}>
            <Trans i18nKey="hero.subtitle" />
          </Text>
        </RiseIn>
      </Flex>

      <Flex flex={1} />

      <Flex
        position="absolute"
        width="100%"
        centered
        pointerEvents="none"
        bottom={48}
        style={{ transform: `translate(0px, ${translateY}px)`, opacity: opacityY }}
        $midHeight={{ display: 'none' }}
      >
        <RiseIn delay={0.3}>
          <Flex
            alignItems="center"
            justifyContent="flex-start"
            onPress={() => scrollToRef()}
            cursor="pointer"
            width={500}
          >
            <Hover>
              <ColumnCenter>
                <Text variant="body2">
                  <Trans i18nKey="hero.scroll" />
                </Text>
                <ChevronDown />
              </ColumnCenter>
            </Hover>
          </Flex>
        </RiseIn>
      </Flex>
    </Flex>
  )
}
