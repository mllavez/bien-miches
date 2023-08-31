import * as Form from '@radix-ui/react-form';

export function LaunchForm() {
  return (
    <Form.Root className="FormRoot">
      <Form.Field className="FormField" name="email">
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <Form.Message className="FormMessage" match="valueMissing">
            Please enter your email
          </Form.Message>
        </div>
        <Form.Submit asChild>
          <button className="Button" style={{marginTop: 10}}>
            Post question
          </button>
        </Form.Submit>
      </Form.Field>
    </Form.Root>
  );
}
