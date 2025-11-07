# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e10]:
    - generic [ref=e12]: Sign in to Open WebUI
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Email
        - textbox "Email" [ref=e16]:
          - /placeholder: Enter Your Email
          - text: test.student@example.com
      - generic [ref=e17]:
        - generic [ref=e18]: Password
        - generic [ref=e19]:
          - generic [ref=e20]: Enter Your Password
          - textbox "Password Enter Your Password" [ref=e21]:
            - /placeholder: Enter Your Password
            - text: WrongPassword123!
          - button "Make password visible in the user interface" [ref=e22] [cursor=pointer]:
            - img [ref=e23]
    - button "Sign in" [active] [ref=e27] [cursor=pointer]
  - generic [ref=e31]: Open WebUI
```