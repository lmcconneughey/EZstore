'use client'

import { updateUserSchema } from "@/lib/validators";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/lib/actions/user.actions";

const UpdateUserForm = ({
    user,
}: {
    user: z.infer<typeof updateUserSchema>
}) => {
    const router = useRouter()

    const form = useForm<z.infer<typeof updateUserSchema>>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: user
    });

    const onSubmit = async (values: z.infer<typeof updateUserSchema>) => {
        try {
            const res = await updateUser({
                ...values,
                id: user.id
            })

            if(!res.success) {
                toast.error(res.message)
                return;
            }

            toast.success(res.message);

            form.reset();

            router.push('/admin/users')
            
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return ( <Form {...form}>
        <form 
            method="POST" 
            onSubmit={form.handleSubmit(onSubmit)}
        >
            {/* email */}
            <div className="">
                <FormField  
                    control={form.control}
                    name='email' 
                    render={({field}: {field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'email'>}) => (
                        <FormItem className="w-full flex flex-col items-start">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled={true} placeholder="Enter User Email" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* name */}
            <div className="">
                <FormField  
                    control={form.control}
                    name='name' 
                    render={({field}: {field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'name'>}) => (
                        <FormItem className="w-full flex flex-col items-start">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter User Name" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* role */}
            <div className="">
                <FormField  
                    control={form.control}
                    name='role' 
                    render={({field}: {field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'role'>}) => (
                        <FormItem className="w-full flex flex-col items-start">
                            <FormLabel>Role</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                            placeholder='Select a role'
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex-between mt-4">
                <Button
                    type='submit'
                    className='w-full'
                    disabled={form.formState.isSubmitting}
                >
                    { 
                        form.formState.isSubmitting ?
                        'Submiting...' :
                        'Update User'
                    }
                </Button>
            </div>
        </form>
    </Form> );
}
 
export default UpdateUserForm;