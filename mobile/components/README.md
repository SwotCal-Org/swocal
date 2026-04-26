# components/

App-specific React components. Each file exports one named component.

## Files

| File              | What                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `swocal-card.tsx` | The merchant card shown in the swipe deck.                          |
| `haptic-tab.tsx`  | Tab bar button wrapper that fires haptic feedback on press (iOS).   |

## ui/

Headless-style primitives — `Button`, `Chip`, `Input`. Use these instead of
raw `Pressable` / `TextInput` so design tokens stay consistent.

## Conventions

- Components are stateless where possible. Put screen state in the screen file.
- Style with the tokens in `@/constants/Colors` (`Swo`, `Spacing`, `Radius`,
  `Shadow`, `Type`). Don't hard-code hex values.
- Files with one component get the component's kebab-case name. Multi-export
  utility files would get a domain name.
