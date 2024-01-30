import { ComponentProps } from 'react'

export function AppleLogo(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="apple-logo"
    >
      <path
        d="M11.6662 8.50891C11.6741 7.89565 11.837 7.29436 12.1397 6.76098C12.4424 6.22759 12.8752 5.77945 13.3976 5.45824C13.0657 4.98422 12.6279 4.59412 12.1188 4.31892C11.6098 4.04372 11.0436 3.89101 10.4652 3.87292C9.23139 3.74341 8.03528 4.6112 7.40655 4.6112C6.76567 4.6112 5.79765 3.88578 4.75526 3.90722C4.08101 3.92901 3.4239 4.12507 2.84796 4.47632C2.27202 4.82757 1.79688 5.32201 1.46884 5.91149C0.0478641 8.37169 1.10779 11.9874 2.46897 13.976C3.14999 14.9498 3.94592 16.0375 4.98737 15.999C6.00649 15.9567 6.38712 15.3491 7.61728 15.3491C8.83603 15.3491 9.19314 15.999 10.2557 15.9744C11.3493 15.9567 12.0383 14.9963 12.6954 14.0133C13.1847 13.3195 13.5613 12.5526 13.8111 11.7411C13.1757 11.4724 12.6336 11.0226 12.2521 10.4479C11.8707 9.87307 11.6669 9.19873 11.6662 8.50891Z"
        fill={props.fill ?? 'white'}
      />
      <path
        d="M9.65929 2.56468C10.2555 1.8489 10.5493 0.928877 10.4782 0C9.56722 0.0956776 8.72575 0.531052 8.12144 1.21937C7.82597 1.55564 7.59968 1.94684 7.45549 2.37061C7.3113 2.79438 7.25205 3.24242 7.28112 3.68911C7.73676 3.6938 8.18752 3.59504 8.59946 3.40027C9.0114 3.2055 9.37377 2.9198 9.65929 2.56468Z"
        fill={props.fill ?? 'white'}
      />
    </svg>
  )
}