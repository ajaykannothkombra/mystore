import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { Alert, Button, Heading, Input, Text } from "@medusajs/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
      <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
        <div className="mb-4 flex flex-col items-center">
          <Heading>Point of Sale</Heading>
          <Text size="small" className="text-ui-fg-subtle text-center">
            Sign in to access
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-y-3">
          {error && (
            <Alert
              className="bg-ui-bg-base items-center p-2"
              dismissible
              variant="error"
            >
              {error}
            </Alert>
          )}

          <div className="mb-4 flex flex-col space-y-2 gap-y-2">
            <Input
              id="email"
              autoComplete="email"
              className="bg-ui-bg-field-component"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
            <Input
              id="password"
              type="password"
              className="bg-ui-bg-field-component"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

          <Button className="w-full" type="submit" isLoading={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
