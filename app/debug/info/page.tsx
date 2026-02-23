"use client";

import { authClient } from "@/app/auth-client";

export default function DebugInformation(): React.ReactElement {
  const { data, error, isPending } = authClient.useSession();

  if (error) {
    return <div>error: {error.message}</div>;
  } else if (data) {
    return (
      <div>
        <h1>user details </h1>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong>
            {Object.entries(value).map(([k, v]) => (
              <div key={k}> {`${k}: ${v}`} </div>
            ))}
          </div>
        ))}
      </div>
    );
  } else if (isPending) {
    return <div> pending </div>;
  } else {
    return <div> not logged in i guess? </div>;
  }
}
