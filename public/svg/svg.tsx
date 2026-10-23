import React, { SVGProps } from "react";
import { motion } from "framer-motion";
import { SVGMotionProps } from "framer-motion";

export function UserIcon({
  size = 20,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
        stroke="#141B34"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function CartIcon({
  size = 20,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 16L16.7201 15.2733C19.4486 15.046 20.0611 14.45 20.3635 11.7289L21 6"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M6 6L22 6"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="6" cy="20" r="2" stroke="black" strokeWidth="1.25" />
      <circle cx="17" cy="20" r="2" stroke="black" strokeWidth="1.25" />
      <path
        d="M8 20L15 20"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M2 2L2.966 2C3.91068 2 4.73414 2.62459 4.96326 3.51493L7.93852 15.0765C8.08887 15.6608 7.9602 16.2797 7.58824 16.7616L6.63213 18"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeartIcon({
  size = 20,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21L10.55 19.7C8.86667 18.1833 7.475 16.875 6.375 15.775C5.275 14.675 4.4 13.6917 3.75 12.825C3.1 11.9417 2.64167 11.1333 2.375 10.4C2.125 9.66666 2 8.91666 2 8.14999C2 6.58333 2.525 5.27499 3.575 4.22499C4.625 3.17499 5.93333 2.64999 7.5 2.64999C8.36667 2.64999 9.19167 2.83333 9.975 3.19999C10.7583 3.56666 11.4333 4.08333 12 4.74999C12.5667 4.08333 13.2417 3.56666 14.025 3.19999C14.8083 2.83333 15.6333 2.64999 16.5 2.64999C18.0667 2.64999 19.375 3.17499 20.425 4.22499C21.475 5.27499 22 6.58333 22 8.14999C22 8.91666 21.8667 9.66666 21.6 10.4C21.35 11.1333 20.9 11.9417 20.25 12.825C19.6 13.6917 18.725 14.675 17.625 15.775C16.525 16.875 15.1333 18.1833 13.45 19.7L12 21ZM12 18.3C13.6 16.8667 14.9167 15.6417 15.95 14.625C16.9833 13.5917 17.8 12.7 18.4 11.95C19 11.1833 19.4167 10.5083 19.65 9.92499C19.8833 9.325 20 8.73333 20 8.14999C20 7.14999 19.6667 6.31666 19 5.65C18.3333 4.98333 17.5 4.64999 16.5 4.64999C15.7167 4.64999 14.9917 4.87499 14.325 5.32499C13.6583 5.75833 13.2 6.31666 12.95 6.99999H11.05C10.8 6.31666 10.3417 5.75833 9.675 5.32499C9.00833 4.87499 8.28333 4.64999 7.5 4.64999C6.5 4.64999 5.66667 4.98333 5 5.65C4.33333 6.31666 4 7.14999 4 8.14999C4 8.73333 4.11667 9.325 4.35 9.92499C4.58333 10.5083 5 11.1833 5.6 11.95C6.2 12.7 7.01667 13.5917 8.05 14.625C9.08333 15.6417 10.4 16.8667 12 18.3Z"
        fill="#1D1B20"
      />
    </svg>
  );
}

export function SearchIcon({
  size = 16,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  const clipId = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M13.125 13.125L16.5 16.5"
          stroke="#505050"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 8.25C15 4.52208 11.9779 1.5 8.25 1.5C4.52208 1.5 1.5 4.52208 1.5 8.25C1.5 11.9779 4.52208 15 8.25 15C11.9779 15 15 11.9779 15 8.25Z"
          stroke="#505050"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="50"
      height="40"
      viewBox="0 0 50 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 0H33.3333L50 40H35.2529L34.1149 36.9872H24.4943L27.2874 27.0513H30.3908L20 0ZM18.2874 40H0L16.6667 0L23.4598 22.6282L18.2874 40Z"
        fill="#4F0065"
      />
    </svg>
  );
}

export function LogoWhite(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="50"
      height="40"
      viewBox="0 0 50 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 0H33.3333L50 40H35.2529L34.1149 36.9872H24.4943L27.2874 27.0513H30.3908L20 0ZM18.2874 40H0L16.6667 0L23.4598 22.6282L18.2874 40Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function FliterIcon({
  size = 40,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.6003 11.0833H26.3837C27.4503 11.0833 28.317 11.95 28.317 13.0166V15.15C28.317 15.9333 27.8337 16.9 27.3503 17.3833L23.1837 21.0666C22.6003 21.55 22.217 22.5166 22.217 23.3V27.4666C22.217 28.05 21.8337 28.8166 21.3503 29.1166L20.0003 29.9666C18.7337 30.75 17.0003 29.8666 17.0003 28.3166V23.1833C17.0003 22.5 16.617 21.6333 16.217 21.15L12.5337 17.2666C12.0503 16.8 11.667 15.9166 11.667 15.3333V13.1166C11.667 11.95 12.5337 11.0833 13.6003 11.0833Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#6C6C6C"
      />
      <path
        d="M14.9997 36.6666H24.9997C33.333 36.6666 36.6663 33.3333 36.6663 25V15C36.6663 6.66665 33.333 3.33331 24.9997 3.33331H14.9997C6.66634 3.33331 3.33301 6.66665 3.33301 15V25C3.33301 33.3333 6.66634 36.6666 14.9997 36.6666Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#6C6C6C"
      />
    </svg>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 18C5.17107 18.4117 4 19.0443 4 19.7537C4 20.9943 7.58172 22 12 22C16.4183 22 20 20.9943 20 19.7537C20 19.0443 18.8289 18.4117 17 18"
        stroke="#15340B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
        stroke="#15340B"
        strokeWidth="1.5"
      />
      <path
        d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z"
        stroke="#15340B"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function InstagramIcon({
  size = 24,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6773 18.8235H3.14627C1.41466 18.8235 0 17.4089 0 15.6773V3.14627C0 1.41466 1.41466 0 3.14627 0H15.6773C17.4089 0 18.8235 1.41466 18.8235 3.14627V15.6773C18.8235 17.4166 17.4166 18.8235 15.6773 18.8235Z"
        fill="white"
      />
      <path
        d="M9.41573 14.247C8.12475 14.247 6.91108 13.7445 5.99889 12.8323C5.0867 11.9201 4.58423 10.7065 4.58423 9.41549C4.58423 8.12451 5.0867 6.91084 5.99889 5.99865C6.91108 5.08646 8.12475 4.58398 9.41573 4.58398C10.7067 4.58398 11.9204 5.08646 12.8326 5.99865C13.7448 6.91084 14.2472 8.12451 14.2472 9.41549C14.2472 10.7065 13.7448 11.9201 12.8326 12.8323C11.9126 13.7445 10.7067 14.247 9.41573 14.247ZM9.41573 5.61213C7.32079 5.61213 5.61237 7.31282 5.61237 9.41549C5.61237 11.5104 7.31306 13.2188 9.41573 13.2188C11.5107 13.2188 13.2191 11.5182 13.2191 9.41549C13.2114 7.32055 11.5107 5.61213 9.41573 5.61213Z"
        fill="#004A19"
      />
      <path
        d="M15.1889 4.42566C15.7012 4.42566 16.1166 4.01032 16.1166 3.49798C16.1166 2.98565 15.7012 2.57031 15.1889 2.57031C14.6766 2.57031 14.2612 2.98565 14.2612 3.49798C14.2612 4.01032 14.6766 4.42566 15.1889 4.42566Z"
        fill="#004A19"
      />
    </svg>
  );
}

export function XIcon({
  size = 24,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="23"
      height="21"
      viewBox="0 0 23 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.11815 0H0L8.43965 11.0895L0.539888 20.3922H4.18981L10.1647 13.3563L15.4701 20.3275H22.5882L13.9034 8.91578L13.9188 8.93547L21.3966 0.129546H17.7466L12.1935 6.66895L7.11815 0ZM3.92909 1.94212H6.14506L18.6591 18.3853H16.4432L3.92909 1.94212Z"
        fill="white"
      />
    </svg>
  );
}

export function FacebookIcon({
  size = 24,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="13"
      height="22"
      viewBox="0 0 13 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.73175 12.7671V21.9608H3.50853V12.7671H0V9.03933H3.50853V7.68303C3.50853 2.64764 5.61202 0 10.0627 0C11.4271 0 11.7682 0.219283 12.5154 0.397958V4.08516C11.6788 3.93897 11.4433 3.85776 10.5743 3.85776C9.54287 3.85776 8.9906 4.15013 8.48706 4.72677C7.98352 5.3034 7.73175 6.30236 7.73175 7.73176V9.04745H12.5154L11.2322 12.7753H7.73175V12.7671Z"
        fill="white"
      />
    </svg>
  );
}

export function MailIcon({
  size = 24,
  ...props
}: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 20C3.45 20 2.97933 19.8043 2.588 19.413C2.19667 19.0217 2.00067 18.5507 2 18V6C2 5.45 2.196 4.97933 2.588 4.588C2.98 4.19667 3.45067 4.00067 4 4H20C20.55 4 21.021 4.196 21.413 4.588C21.805 4.98 22.0007 5.45067 22 6V18C22 18.55 21.8043 19.021 21.413 19.413C21.0217 19.805 20.5507 20.0007 20 20H4ZM12 13L20 8V6L12 11L4 6V8L12 13Z"
        fill="white"
      />
    </svg>
  );
}