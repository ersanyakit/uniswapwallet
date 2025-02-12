import {
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication'
import { useAppSelector } from 'src/app/hooks'
import { BiometricAuthenticationStatus, tryLocalAuthenticate } from 'src/features/biometrics'
import { useBiometricContext } from 'src/features/biometrics/context'
import { BiometricSettingsState } from 'src/features/biometrics/slice'
import { useAsyncData } from 'wallet/src/utils/hooks'

/**
 * Hook shortcut to use the biometric prompt.
 * @returns trigger Trigger the OS biometric flow and invokes successCallback on success.
 */
export function useBiometricPrompt<T = undefined>(
  successCallback?: (params?: T) => void
): {
  trigger: (params?: T) => Promise<void>
} {
  const { setAuthenticationStatus } = useBiometricContext()

  const trigger = async (params?: T): Promise<void> => {
    setAuthenticationStatus(BiometricAuthenticationStatus.Authenticating)
    const authStatus = await tryLocalAuthenticate()

    setAuthenticationStatus(authStatus)

    if (
      biometricAuthenticationSuccessful(authStatus) ||
      biometricAuthenticationDisabledByOS(authStatus)
    ) {
      successCallback?.(params)
    }
  }

  return { trigger }
}

export function biometricAuthenticationSuccessful(status: BiometricAuthenticationStatus): boolean {
  return status === BiometricAuthenticationStatus.Authenticated
}

export function biometricAuthenticationDisabledByOS(
  status: BiometricAuthenticationStatus
): boolean {
  return (
    status === BiometricAuthenticationStatus.Unsupported ||
    status === BiometricAuthenticationStatus.MissingEnrollment
  )
}

/**
 * Check function of biometric device support
 * @returns object representing biometric auth support by type
 */
export function useDeviceSupportsBiometricAuth(): { touchId: boolean; faceId: boolean } {
  // check if device supports biometric authentication
  const authenticationTypes = useAsyncData(supportedAuthenticationTypesAsync).data
  return {
    touchId: authenticationTypes?.includes(AuthenticationType.FINGERPRINT) ?? false,
    faceId: authenticationTypes?.includes(AuthenticationType.FACIAL_RECOGNITION) ?? false,
  }
}

const checkOsBiometricAuthEnabled = async (): Promise<boolean> => {
  const [compatible, enrolled] = await Promise.all([hasHardwareAsync(), isEnrolledAsync()])
  return compatible && enrolled
}

/**
 * Hook to determine whether biometric auth is enabled in OS settings
 * @returns if Face ID or Touch ID is enabled
 */
export function useOsBiometricAuthEnabled(): boolean | undefined {
  return useAsyncData(checkOsBiometricAuthEnabled).data
}

export function useBiometricAppSettings(): BiometricSettingsState {
  const biometricSettings = useAppSelector((state) => state.biometricSettings)
  return biometricSettings
}
